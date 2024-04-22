import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import { CreateCartQuoteDto } from './dto/create-cart-quote.dto';
import { UpdateCartQuoteDto } from './dto/update-cart-quote.dto';
import { CartQuote } from './entities/cart-quote.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { State } from '../states/entities/state.entity';
import { QuoteDetail } from '../quote-details/entities/quote-detail.entity';
import { VariantReference } from '../variant-reference/entities/variant-reference.entity';
import { MarkedServicePrice } from '../marked-service-prices/entities/marked-service-price.entity';
import { MarkingService } from '../marking-services/entities/marking-service.entity';
import { Logo } from '../logos/entities/logo.entity';
import { Packing } from '../packings/entities/packing.entity';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';
import { OrderListDetail } from '../order-list-details/entities/order-list-detail.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { SupplierPurchaseOrder } from '../supplier-purchase-orders/entities/supplier-purchase-order.entity';
import { Brand } from '../brands/entities/brand.entity';
import { RemoveQuoteDetailDto } from './dto/remove-quote-detail.dto';

@Injectable()
export class CartQuotesService {
  constructor(
    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

    @InjectRepository(OrderListDetail)
    private readonly orderListDetailRepository: Repository<OrderListDetail>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,

    @Inject('EMAIL_CONFIG') private emailSenderConfig,
  ) { }

  async create(createCartQuoteDto: CreateCartQuoteDto) {
    const newCartQuote: CartQuote = plainToClass(CartQuote, createCartQuoteDto);

    // newCartQuote.createdBy = user.id;

    const client = await this.clientRepository.findOne({
      where: {
        id: createCartQuoteDto.client,
      },
    });

    if (!client)
      throw new NotFoundException(`Client with id ${createCartQuoteDto.client} not found`);

    const userDb = await this.userRepository.findOne({
      where: {
        id: createCartQuoteDto.user,
      },
    });

    if (!userDb)
      throw new NotFoundException(`User with id ${createCartQuoteDto.user} not found`);

    if (createCartQuoteDto.state) {
      const state = await this.stateRepository.findOne({
        where: {
          id: createCartQuoteDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createCartQuoteDto.state} not found`);

      newCartQuote.state = state;
    }

    if (createCartQuoteDto.brandId) {
      if (createCartQuoteDto.brandId != null) {
        const brandId: string = createCartQuoteDto.brandId;

        const brand: Brand = await this.brandRepository.findOne({
          where: {
            id: brandId,
          },
        });

        if (!brand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (!brand.isActive)
          throw new BadRequestException(`Brand with id ${brandId} is currently inactive`);

        newCartQuote.brandId = brand.id;
      } else {
        newCartQuote.brandId = null;
      }
    }

    newCartQuote.client = client;
    newCartQuote.user = userDb;

    await this.cartQuoteRepository.save(newCartQuote);

    return {
      newCartQuote
    };
  }

  async dupplyCartQuote(id: string) {
    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'quoteDetails',
        'client',
        'client.user',
        'user',
        'client.user.company',
        'quoteDetails.transportServices',
        'quoteDetails.product',
        'quoteDetails.product.colors',
        'quoteDetails.product.variantReferences',
        'quoteDetails.product.images',
        'quoteDetails.markingServices',
        'quoteDetails.markingServices.logos',
        'quoteDetails.markingServices.marking',
        'quoteDetails.markingServices.externalSubTechnique',
        'quoteDetails.markingServices.markingServiceProperty',
        'quoteDetails.markingServices.markingServiceProperty.markedServicePrices',
        'quoteDetails.product.packings',
        'quoteDetails.product.refProduct',
        'quoteDetails.product.refProduct.images',
        'quoteDetails.product.refProduct.supplier',
        'quoteDetails.product.refProduct.supplier.disccounts',
        'quoteDetails.product.refProduct.supplier.disccounts.disccounts',
        'quoteDetails.product.refProduct.packings',
        'state',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    if (!cartQuote.isActive)
      throw new BadRequestException(`The cart quote with id ${id} is currently inactive`);

    try {
      const newCartQuote: CartQuote = plainToClass(CartQuote, cartQuote);
      delete newCartQuote.id;
      newCartQuote.state = null;
      newCartQuote.isActive = true;
      newCartQuote.isAllowed = true;

      if (cartQuote.quoteDetails.length > 0) {
        const quoteDetails: QuoteDetail[] = [];

        for (const quoteDetail of cartQuote.quoteDetails) {
          const newQuoteDetail: QuoteDetail = plainToClass(QuoteDetail, quoteDetail);
          delete newQuoteDetail.id;

          const createdQuoteDetail: QuoteDetail = await this.quoteDetailRepository.save(newQuoteDetail);

          quoteDetails.push(createdQuoteDetail);
        };

        newCartQuote.quoteDetails = quoteDetails;
      };

      if (cartQuote.orderListDetail) {
        const newOrderListDetail: OrderListDetail = plainToClass(OrderListDetail, cartQuote.orderListDetail);
        delete newOrderListDetail.id;

        const createdOrderListDetail: OrderListDetail = await this.orderListDetailRepository.save(newOrderListDetail);

        newCartQuote.orderListDetail = createdOrderListDetail;
      };

      const createdCartQuote: CartQuote = await this.cartQuoteRepository.save(newCartQuote);

      return {
        createdCartQuote
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Internal server error');
    }
  };

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.cartQuoteRepository.count();

    const { limit = count, offset = 0, isAllowed = 1 } = paginationDto;

    const isAllowedBoolean: boolean = isAllowed == 1 ? true : false;

    const cartQuotes: CartQuote[] = await this.cartQuoteRepository.find({
      take: limit,
      skip: offset,
      where: {
        isActive: true,
        isAllowed: isAllowedBoolean,
      },
      relations: [
        'quoteDetails',
        'client',
        'client.user',
        'user',
        'client.user.company',
        'quoteDetails.transportServices',
        'quoteDetails.product',
        'quoteDetails.product.colors',
        'quoteDetails.product.variantReferences',
        'quoteDetails.product.images',
        'quoteDetails.markingServices',
        'quoteDetails.markingServices.logos',
        'quoteDetails.markingServices.marking',
        'quoteDetails.markingServices.externalSubTechnique',
        'quoteDetails.markingServices.markingServiceProperty',
        'quoteDetails.markingServices.markingServiceProperty.markedServicePrices',
        'quoteDetails.product.packings',
        'quoteDetails.product.refProduct',
        'quoteDetails.product.refProduct.images',
        'quoteDetails.product.refProduct.supplier',
        'quoteDetails.product.refProduct.supplier.disccounts',
        'quoteDetails.product.refProduct.supplier.disccounts.disccounts',
        'quoteDetails.product.refProduct.packings',
        'state',
      ],
    });

    const cartQuotesWithBrand = await Promise.all(cartQuotes.map(async (cartQuote) => {
      const brand: Brand = await this.brandRepository.findOne({
        where: {
          id: cartQuote.brandId,
        }
      });

      return {
        ...cartQuote,
        brandId: brand,
      };
    }));

    return {
      count,
      cartQuotes: cartQuotesWithBrand
    };
  }

  async findOne(id: string) {
    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'quoteDetails',
        'quoteDetails.transportServices',
        'quoteDetails.product',
        'quoteDetails.product.colors',
        'quoteDetails.product.variantReferences',
        'quoteDetails.product.images',
        'quoteDetails.markingServices',
        'quoteDetails.markingServices.logos',
        'quoteDetails.markingServices.marking',
        'quoteDetails.markingServices.externalSubTechnique',
        'quoteDetails.markingServices.markingServiceProperty',
        'quoteDetails.markingServices.markingServiceProperty.markedServicePrices',
        'quoteDetails.product.packings',
        'quoteDetails.product.refProduct',
        'quoteDetails.product.refProduct.images',
        'quoteDetails.product.refProduct.supplier',
        'quoteDetails.product.refProduct.supplier.disccounts',
        'quoteDetails.product.refProduct.supplier.disccounts.disccounts',
        'quoteDetails.product.refProduct.packings',
        'state',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    return {
      cartQuote: cartQuote
    };
  }


  async filterByClient(id: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, isCommercial = 0, isAllowed = 1 } = paginationDto;

    let count: number = 0;

    const isAllowedBoolean: boolean = isAllowed == 1 ? true : false;

    let cartQuotes: CartQuote[] = [];

    if (isCommercial == 1) {
      const commercialUser = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.admin', 'admin')
        .leftJoinAndSelect('admin.clients', 'client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .leftJoinAndSelect('client.cartQuotes', 'cartQuote')
        .where('cartQuote.isActive =:cartQuoteState', { cartQuoteState: true })
        .andWhere('cartQuote.isAllowed =:isAllowedBoolean', { isAllowedBoolean })
        .leftJoinAndSelect('cartQuote.client', 'quoteClient')
        .leftJoinAndSelect('quoteClient.user', 'quoteClientUser')
        .leftJoinAndSelect('quoteClientUser.company', 'quoteClientUserCompany')
        .leftJoinAndSelect('cartQuote.user', 'quoteUser')
        .leftJoinAndSelect('quoteUser.company', 'quoteUserCompany')
        .leftJoinAndSelect('cartQuote.state', 'quoteState')
        .leftJoinAndSelect('cartQuote.quoteDetails', 'quoteDetail')
        .leftJoinAndSelect('quoteDetail.transportServices', 'transportService')
        .leftJoinAndSelect('quoteDetail.product', 'product')
        .leftJoinAndSelect('product.colors', 'productColor')
        .leftJoinAndSelect('product.variantReferences', 'variantReference')
        .leftJoinAndSelect('product.images', 'productImage')
        .leftJoinAndSelect('product.packings', 'productPacking')
        .leftJoinAndSelect('product.refProduct', 'refProduct')
        .leftJoinAndSelect('refProduct.images', 'refProductImage')
        .leftJoinAndSelect('refProduct.packings', 'refProductPacking')
        .leftJoinAndSelect('refProduct.supplier', 'supplier')
        .leftJoinAndSelect('supplier.disccounts', 'supplierDiscount')
        .leftJoinAndSelect('supplierDiscount.disccounts', 'nestedSupplierDiscount')
        .leftJoinAndSelect('quoteDetail.markingServices', 'markingService')
        .leftJoinAndSelect('markingService.logos', 'markingServiceLogo')
        .leftJoinAndSelect('markingService.marking', 'marking')
        .leftJoinAndSelect('markingService.externalSubTechnique', 'externalSubTechnique')
        .leftJoinAndSelect('markingService.markingServiceProperty', 'markingServiceProperty')
        .leftJoinAndSelect('markingServiceProperty.markedServicePrices', 'markedServicePrice')
        .andWhere('user.id = :id', { id })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getOne();

      if (!commercialUser)
        throw new NotFoundException(`Commercial user with ID ${id} not found.`);

      const clientsWithCartQuotes = commercialUser.admin.clients.map(client => {
        const clientInfo = classToPlain(client, { exposeDefaultValues: true });
        clientInfo.user = classToPlain(client.user, { exposeDefaultValues: true });
        clientInfo.cartQuotes = client.cartQuotes.map(cartQuote => classToPlain(cartQuote, { exposeDefaultValues: true }));
        return clientInfo;
      });

      cartQuotes = clientsWithCartQuotes.flatMap(client => {
        return client.cartQuotes.map(cartQuote => {
          cartQuote.user = client.user;
          return plainToClass(CartQuote, cartQuote);
        });
      });

    } else {
      cartQuotes = await this.cartQuoteRepository
        .createQueryBuilder('quote')
        .where('quote.isActive =:isActive', { isActive: true })
        .andWhere('quote.isAllowed =:isAllowedBoolean', { isAllowedBoolean })
        .leftJoinAndSelect('quote.state', 'state')
        .leftJoinAndSelect('quote.client', 'client')
        .andWhere('client.id =:id', { id })
        .leftJoinAndSelect('client.user', 'user')
        .leftJoinAndSelect('user.company', 'company')
        .leftJoinAndSelect('quote.quoteDetails', 'quoteDetails')
        .leftJoinAndSelect('quoteDetails.product', 'product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('quote.orderListDetail', 'orderListDetail')
        .leftJoinAndSelect('orderListDetail.orderRating', 'orderRating')
        .leftJoinAndSelect('quoteDetails.transportServices', 'transportServices')
        .leftJoinAndSelect('product.colors', 'colors')
        .leftJoinAndSelect('product.variantReferences', 'variantReferences')
        .leftJoinAndSelect('quoteDetails.markingServices', 'markingServices')
        .leftJoinAndSelect('markingServices.logos', 'logos')
        .leftJoinAndSelect('markingServices.marking', 'marking')
        .leftJoinAndSelect('markingServices.externalSubTechnique', 'externalSubTechnique')
        .leftJoinAndSelect('markingServices.markingServiceProperty', 'markingServiceProperty')
        .leftJoinAndSelect('markingServiceProperty.markedServicePrices', 'markedServicePrices')
        .leftJoinAndSelect('product.packings', 'packings')
        .leftJoinAndSelect('product.refProduct', 'refProduct')
        .leftJoinAndSelect('refProduct.images', 'refImages')
        .leftJoinAndSelect('refProduct.supplier', 'supplier')
        .leftJoinAndSelect('supplier.disccounts', 'disccounts')
        .leftJoinAndSelect('disccounts.disccounts', 'discounts')
        .leftJoinAndSelect('refProduct.packings', 'refPackings')
        .take(limit)
        .skip(offset)
        .getMany();
    }

    const cartQuotesWithOneImage = await Promise.all(cartQuotes.map(async (cartQuote) => {
      const brand: Brand = await this.brandRepository.findOne({
        where: {
          id: cartQuote.brandId,
        }
      });

      return {
        ...cartQuote,
        brandId: brand,
        quoteDetails: cartQuote.quoteDetails.map((quoteDetail: QuoteDetail) => ({
          ...quoteDetail,
          product: {
            ...quoteDetail.product,
            image: quoteDetail.product.images[0] || '',
          }
        })),
      };
    }));

    count = (await cartQuotesWithOneImage).length;

    return {
      count,
      cartQuotes: cartQuotesWithOneImage
    };
  }

  async removeQuoteDetail(id: string, removeQuoteDetailDto: RemoveQuoteDetailDto) {
    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: { id },
      relations: ['quoteDetails'],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    const quoteDetailsToRemove: QuoteDetail[] = cartQuote.quoteDetails.filter(
      (quoteDetail: QuoteDetail) => removeQuoteDetailDto.quoteDetails.includes(quoteDetail.id),
    );

    let newTotalPrice = cartQuote.totalPrice;

    quoteDetailsToRemove.forEach((quoteDetail: QuoteDetail) => {
      newTotalPrice -= quoteDetail.totalValue;
    });

    cartQuote.quoteDetails = cartQuote.quoteDetails.filter(
      (quoteDetail: QuoteDetail) => !quoteDetailsToRemove.includes(quoteDetail),
    );

    cartQuote.totalPrice = newTotalPrice;
    const updatedCartQuote: CartQuote = await this.cartQuoteRepository.save(cartQuote);

    return {
      cartQuote
    };
  }

  async update(id: string, updateCartQuoteDto: UpdateCartQuoteDto, user: User) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'client',
        'user',
        'state',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    const updatedCartQuote = plainToClass(CartQuote, updateCartQuoteDto);

    if (updateCartQuoteDto.client) {
      const client = await this.clientRepository.findOne({
        where: {
          id: updateCartQuoteDto.client,
        },
      });

      if (!client)
        throw new NotFoundException(`Client with id ${updateCartQuoteDto.client} not found`);

      updatedCartQuote.client = client;
    };

    if (updateCartQuoteDto.user) {
      const user = await this.userRepository.findOne({
        where: {
          id: updateCartQuoteDto.user,
        },
      });

      if (!user)
        throw new NotFoundException(`User with id ${updateCartQuoteDto.user} not found`);

      updatedCartQuote.user = user;
    };

    if (updateCartQuoteDto.brandId) {
      const brandId: string = updateCartQuoteDto.brandId;

      const brand: Brand = await this.brandRepository.findOne({
        where: {
          id: brandId,
        },
      });

      if (!brand)
        throw new NotFoundException(`Brand with id ${brandId} not found`);

      if (!brand.isActive)
        throw new BadRequestException(`Brand with id ${brandId} is currently inactive`);

      updatedCartQuote.brandId = brand.id;
    };

    if (updateCartQuoteDto.state) {
      const state = await this.stateRepository.findOne({
        where: {
          id: updateCartQuoteDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updateCartQuoteDto.state} not found`);

      updatedCartQuote.state = state;
    }

    updatedCartQuote.updatedBy = user.id;

    Object.assign(cartQuote, updatedCartQuote);

    await this.cartQuoteRepository.save(cartQuote);

    return {
      cartQuote
    };
  }

  async desactivate(id: string) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    cartQuote.isActive = !cartQuote.isActive;

    await this.cartQuoteRepository.save(cartQuote);

    return {
      cartQuote
    };
  }

  async changeStatus(user: User, id: string, updateCartQuoteDto: UpdateCartQuoteDto) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'quoteDetails',
        'quoteDetails.product',
        'quoteDetails.product.refProduct',
        'quoteDetails.markingServices',
        'user',
        'client',
        'client.user',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    const stateDb: State = await this.stateRepository.findOne({
      where: {
        id: updateCartQuoteDto.state,
      },
    });

    if (!stateDb)
      throw new NotFoundException(`State with id ${updateCartQuoteDto.state} not found`);

    cartQuote.state = stateDb;
    let purchaseOrderCreated: PurchaseOrder;

    if (stateDb.name.toLowerCase() == 'aprobada' || stateDb.name.toLowerCase() == 'rechazada') {
      cartQuote.user = user;
    };

    if (stateDb.name.toLowerCase() == 'rechazada') {
      cartQuote.isAllowed = false;
    };

    if (stateDb.name.toLowerCase() == 'en proceso') {
      //const commercialId: string = user?.client?.commercialId;

      const commercialUserFound: User = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.admin', 'userAdmin')
        .leftJoinAndSelect('userAdmin.clients', 'userAdminClients')
        .where('userAdminClients.id =:clientId', { clientId: user.id })
        .getOne();

      const commercialId: string = commercialUserFound?.id;
      const commercialUser: User = await this.userRepository.findOne({
        where: {
          id: commercialId,
        },
      });

      // if (!commercialUser)
      //   throw new NotFoundException(`Commercial user with id ${commercialId} not found`);

      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: this.emailSenderConfig.transport.from,
          to: [commercialUser.email],
          subject: 'Solicitud de cotización de carrito',
          html: `
              Señor Comercial, el cliente ${user.name} le ha enviado una solicitud de cotización para la compra de productos <br />
              Información del carrito: ${cartQuote.quoteName} <br />
              Fecha de realización: ${cartQuote.createdAt} <br />
              `,
        });
      } catch (error) {
        console.log('Failed to send the email', error);
        throw new InternalServerErrorException(`Internal server error`);
      }
    };

    if (updateCartQuoteDto.generateOrder) {
      const orderListDetailsCreated: OrderListDetail[] = [];

      const cartClient: Client = cartQuote.client;

      cartQuote.isAllowed = false;

      let supplierPurchaseOrderState: State;
      let orderListDetailState: State;

      if (cartClient.user.isCoorporative == 1) {
        orderListDetailState = await this.stateRepository
          .createQueryBuilder('state')
          .where('LOWER(state.name) =:name', { name: 'montaje aprobado' })
          .andWhere('LOWER(state.process) =:process', { process: 'pedido corporativo' })
          .getOne();
      } else {
        orderListDetailState = await this.stateRepository
          .createQueryBuilder('state')
          .where('LOWER(state.name) =:name', { name: 'pedido en producción' })
          .andWhere('LOWER(state.process) =:process', { process: 'pedido no corporativo' })
          .getOne();
      };

      if (cartClient.user.isCoorporative == 1) {
        supplierPurchaseOrderState = await this.stateRepository
          .createQueryBuilder('state')
          .where('LOWER(state.name) =:name', { name: 'preaprobada' })
          .andWhere('LOWER(state.process) =:process', { process: 'orden de compra corporativo' })
          .getOne();
      } else {
        if (stateDb.name.toLowerCase() == 'rechazada') {
          supplierPurchaseOrderState = await this.stateRepository
            .createQueryBuilder('state')
            .where('LOWER(state.name) =:name', { name: 'orden de compra pagada' })
            .andWhere('LOWER(state.process) =:process', { process: 'orden de compra no corporativo' })
            .getOne();
        } else {
          supplierPurchaseOrderState = await this.stateRepository
            .createQueryBuilder('state')
            .where('LOWER(state.name) =:name', { name: 'orden de compra pagada' })
            .andWhere('LOWER(state.process) =:process', { process: 'orden de compra no corporativo' })
            .getOne();
        };
      };

      for (const quoteDetail of cartQuote.quoteDetails) {
        const supplierPurchaseOrderData = {
          state: supplierPurchaseOrderState,
          orderCode: uuidv4(),
        };

        const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrderData);

        let expirationDate: Date = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const lastOrders = await this.orderListDetailRepository.find({
          order: {
            createdAt: 'DESC',
          },
          take: 1
        });

        const lastOrder = lastOrders[0];

        let nextOrderNumber = 10000;
        let nextOrderClientNumber = 60000;

        if (lastOrder) {
          const lastOrderNumber: number = parseInt(lastOrder.orderCode);
          nextOrderNumber = lastOrderNumber + 1;

          const lastOrderClientNumber: number = parseInt(lastOrder.orderCodeClient);
          nextOrderClientNumber = lastOrderClientNumber + 1;
        }

        const orderCode: number = nextOrderNumber;
        const orderCodeClient: number = nextOrderClientNumber;

        // Obtener la fecha actual
        let fechaActual = new Date();
        let diaActual = fechaActual.getDate();
        let newDate = quoteDetail?.product?.refProduct?.productInventoryLeadTime + 5;
        let diaDespuesSuma = diaActual + newDate;
        fechaActual.setDate(diaDespuesSuma);

        // Serializar la fecha en formato ISO 8601
        const fechaActualISO = fechaActual.toISOString();

        const orderListDetailData = {
          orderCode,
          orderCodeClient,
          cartQuote: cartQuote,
          quantities: quoteDetail.quantities,
          productTotalPrice: quoteDetail.totalValue,
          clientTagTransportService: quoteDetail.transportServiceTagClient,
          estimatedDeliveryDate: fechaActualISO,
          iva: quoteDetail.iva,
          financingCost: quoteDetail.financingCost,
          withholdingAtSourceValue: quoteDetail.withholdingAtSourceValue,
          feeCost: quoteDetail.aditionalClientFee,
          expirationDate,
          realCost: quoteDetail.totalValue,
          estimatedQuoteCost: quoteDetail.unitPrice,
          tagProductTotalCost: quoteDetail.totalValue,
          samplePrice: quoteDetail.sampleValue,
          tagMarkingTotalCost: quoteDetail.markingTotalPrice,
          transportCost: quoteDetail.transportTotalPrice, 
          realTransportCost: quoteDetail.totalPriceWithTransport,
          realMarkingCost: quoteDetail.markingTotalPrice,
          product: quoteDetail.product,
          supplierPurchaseOrder,
          state: orderListDetailState,
        };

        const orderListDetail: OrderListDetail = await plainToClass(OrderListDetail, orderListDetailData);

        orderListDetail.product = quoteDetail.product;
        orderListDetail.markingServices = quoteDetail.markingServices;

        const orderListDetailCreated: OrderListDetail = await this.orderListDetailRepository.save(orderListDetail);

        orderListDetailsCreated.push(orderListDetailCreated);

        console.log(orderListDetailData)
      };

      const stateToFind: string = cartQuote.user.isCoorporative ? 'preaprobada' : 'orden de compra realizada';

      const state: State = await this.stateRepository
        .createQueryBuilder('state')
        .where('LOWER(name) =:stateToFind', { stateToFind })
        .getOne();

      let expirationDate: Date = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const purchaseOrderData = {
        deliveryAddress: cartQuote.deliveryAddress,
        destinationCity: cartQuote.destinationCity,
        tagOrderNumber: uuidv4(),
        clientOrderNumber: uuidv4(),
        approvalDate: cartQuote.updatedAt,
        creationDate: cartQuote.createdAt,
        // paymentDate: new Date(),
        userApproval: cartQuote.updatedBy,
        // invoiceIssueDate: new Date(),
        // invoiceDueDate: new Date(),
        financingCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.totalValue, 0),
        feeCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.aditionalClientFee, 0),
        businessUtility: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.businessUtility, 0),
        retentionCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.withholdingAtSourceValue, 0),
        expirationDate,
        cartQuote: cartQuote,
        clientUser: cartQuote.client.id,
        commercialUser: cartQuote.user.id,
        value: cartQuote.totalPrice,
        state
      };

      const purchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, purchaseOrderData);

      purchaseOrder.orderListDetails = orderListDetailsCreated;

      purchaseOrderCreated = await this.purchaseOrderRepository.save(purchaseOrder);

      console.log(purchaseOrderData)

    };

    await this.cartQuoteRepository.save(cartQuote);
    console.log()
    
    if (stateDb.name.toLowerCase() == 'en proceso' || stateDb.name.toLowerCase() == 'rechazada') {
      console.log(cartQuote?.user?.email);
    };


    return {
      cartQuote,
      purchaseOrderCreated
    };
  }

  async remove(id: string) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    await this.cartQuoteRepository.remove(cartQuote);

    return {
      cartQuote
    };
  }




}
