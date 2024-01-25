import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
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
  ) { }

  async create(createCartQuoteDto: CreateCartQuoteDto) {
    const newCartQuote = plainToClass(CartQuote, createCartQuoteDto);

    const client = await this.clientRepository.findOne({
      where: {
        id: createCartQuoteDto.client,
      },
    });

    if (!client)
      throw new NotFoundException(`Client with id ${createCartQuoteDto.client} not found`);

    const user = await this.userRepository.findOne({
      where: {
        id: createCartQuoteDto.user,
      },
    });

    if (!user)
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
    }

    newCartQuote.client = client;
    newCartQuote.user = user;

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

      if (cartQuote.state) {
        const state: State = cartQuote.state;

        const newState: State = plainToClass(State, state);
        delete newState.id;

        const createdState = await this.stateRepository.save(newState);

        newCartQuote.state = createdState;
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

    const { limit = count, offset = 0 } = paginationDto;

    const cartQuotes: CartQuote[] = await this.cartQuoteRepository.find({
      take: limit,
      skip: offset,
      where: {
        isActive: true,
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

    const localTransportPricesDb: LocalTransportPrice[] = await this.localTransportPriceRepository.find({
      where: {
        origin: 'Bogota',
      },
    });

    const finalCartQuotes = await Promise.all(cartQuotes.map(async (cartQuote: CartQuote) => {
      let markingTotalPrice: number = 0;

      const brand: Brand = await this.brandRepository.findOne({
        where: {
          id: cartQuote.brandId,
        },
      });

      return {
        id: cartQuote.id,
        brand,
        quoteName: cartQuote.quoteName,
        description: cartQuote.description,
        destinationCity: cartQuote.destinationCity,
        deliveryAddress: cartQuote.deliveryAddress,
        totalPrice: cartQuote.totalPrice,
        user: cartQuote?.user || '',
        client: cartQuote.client,
        company: cartQuote.client.user.company,
        productsQuantity: cartQuote.productsQuantity,
        weightToOrder: cartQuote.weightToOrder,
        createdAt: cartQuote.createdAt,
        state: cartQuote.state?.name || '',
        products: cartQuote.quoteDetails.map((quoteDetail: QuoteDetail) => {
          return {
            id: quoteDetail.id,
            name: quoteDetail.product.refProduct.name,
            discount: quoteDetail.discount,
            iva: quoteDetail.iva,
            subTotal: quoteDetail.subTotal,
            subTotalWithDiscount: quoteDetail.subTotalWithDiscount,
            totalValue: quoteDetail.totalValue,
            total: quoteDetail.total,
            unitPrice: quoteDetail.unitPrice,
            quantity: quoteDetail.quantities,
            image: quoteDetail.product?.refProduct?.images[0]?.url || 'default.png',
            color: quoteDetail.product?.colors[0]?.name || '',
            samplePrice: quoteDetail.product.samplePrice,
            refundSampleTime: quoteDetail.product.refundSampleTime,
            productIva: quoteDetail.product.iva,
            loanSample: quoteDetail.product.loanSample,
            // discount: quoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
            //   if (disccount.maxQuantity !== 0) {
            //     if (quoteDetail.quantities >= disccount.minQuantity && quoteDetail.quantities <= disccount.maxQuantity) {
            //       return Math.max(maxDiscount, disccount.disccountValue);
            //     }
            //   } else {
            //     if (quoteDetail.quantities >= disccount.minQuantity) {
            //       return Math.max(maxDiscount, disccount.disccountValue);
            //     }
            //   }
            //   return maxDiscount;
            // }, 0),
            packings: quoteDetail.product.packings !== undefined
              ? quoteDetail.product.packings.map((packing: Packing) => {
                const packingVolume: number = (packing.height * packing.width * packing.height);
                const productQuantity: number = quoteDetail.quantities;
                const volumeWithQuantities: number = (packingVolume * productQuantity);

                const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

                const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                  ? localTransportPrices.sort((a, b) => {
                    const diffA = Math.abs(a.volume - volumeWithQuantities);
                    const diffB = Math.abs(b.volume - volumeWithQuantities);
                    return diffA - diffB;
                  })[0]
                  : undefined;

                const { origin, destination, price, volume } = closestLocalTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

                const transportCalculation = [{
                  packingVolume,
                  productQuantity,
                  volumeWithQuantities
                }];

                return {
                  unities: packing.unities,
                  large: packing.large,
                  width: packing.width,
                  height: packing.height,
                  smallPackingWeight: packing.smallPackingWeight,
                  transportCalculation,
                  localTransportPrice: {
                    origin,
                    destination,
                    price,
                    volume
                  },
                };
              })
              : quoteDetail.product.refProduct.packings.map((packing: Packing) => {
                const packingVolume: number = (packing.height * packing.width * packing.height);
                const productQuantity: number = quoteDetail.quantities;
                const volumeWithQuantities: number = (packingVolume * productQuantity);

                const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

                const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                  ? localTransportPrices.sort((a, b) => {
                    const diffA = Math.abs(a.volume - volumeWithQuantities);
                    const diffB = Math.abs(b.volume - volumeWithQuantities);
                    return diffA - diffB;
                  })[0]
                  : undefined;

                const { origin, destination, price, volume } = closestLocalTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

                const transportCalculation = [{
                  packingVolume,
                  productQuantity,
                  volumeWithQuantities
                }];

                return {
                  unities: packing.unities,
                  large: packing.large,
                  width: packing.width,
                  height: packing.height,
                  smallPackingWeight: packing.smallPackingWeight,
                  transportCalculation,
                  localTransportPrice: {
                    origin,
                    destination,
                    price,
                    volume
                  },
                };
              }),
            variantReferences: quoteDetail.product.variantReferences.map((variantReference: VariantReference) => {
              return {
                name: variantReference?.name || '',
              };
            }),
            markingServices: quoteDetail.markingServices.map((markingService: MarkingService) => {
              return {
                logo: markingService.logos.map((logo: Logo) => {
                  return {
                    logo: logo?.logo || '',
                    mounting: logo?.mounting || ''
                  };
                }),
                calculatedMarkingPrice: markingService.calculatedMarkingPrice,
                markingTransportPrice: markingService.markingTransportPrice,
                marking: markingService?.marking?.name || '',
                externalSubTechnique: markingService?.externalSubTechnique?.name || '',
                markingServiceProperty: {
                  name: markingService.markingServiceProperty?.name || '',
                  prices: (markingService.markingServiceProperty.markedServicePrices || [])
                    .slice()
                    .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
                    .map((markedServicePrice: MarkedServicePrice) => {
                      markingTotalPrice += markedServicePrice.unitPrice;

                      return {
                        markedServicePrice: markedServicePrice?.unitPrice || 0
                      };
                    }),
                },
              };
            }),
            markingTotalPrice,
          };
        }),
      };
    }));

    return {
      count,
      finalCartQuotes
    };
  }

  async findOne(id: string) {
    const cartQuote = await this.cartQuoteRepository.findOne({
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


    const localTransportPricesDb: LocalTransportPrice[] = await this.localTransportPriceRepository.find({
      where: {
        origin: 'Bogota',
      },
    });

    let markingTotalPrice: number = 0;

    const brand: Brand = await this.brandRepository.findOne({
      where: {
        id: cartQuote.brandId,
      },
    });

    const finalCartQuote = {
      id: cartQuote.id,
      brand,
      quoteName: cartQuote.quoteName,
      description: cartQuote.description,
      destinationCity: cartQuote.destinationCity,
      deliveryAddress: cartQuote.deliveryAddress,
      totalPrice: cartQuote.totalPrice,
      productsQuantity: cartQuote.productsQuantity,
      weightToOrder: cartQuote.weightToOrder,
      createdAt: cartQuote.createdAt,
      state: cartQuote.state?.name || '',
      products: cartQuote.quoteDetails.map((quoteDetail: QuoteDetail) => {
        return {
          name: quoteDetail.product.refProduct.name,
          unitPrice: quoteDetail.unitPrice,
          quantity: quoteDetail.quantities,
          image: quoteDetail.product?.refProduct?.images[0]?.url || 'default.png',
          color: quoteDetail?.product?.colors[0]?.name,
          iva: quoteDetail.product.iva,
          samplePrice: quoteDetail.product.samplePrice,
          refundSampleTime: quoteDetail.product.refundSampleTime,
          loanSample: quoteDetail.product.loanSample,
          discount: quoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
            if (disccount.maxQuantity !== 0) {
              if (quoteDetail.quantities >= disccount.minQuantity && quoteDetail.quantities <= disccount.maxQuantity) {
                return Math.max(maxDiscount, disccount.disccountValue);
              }
            } else {
              if (quoteDetail.quantities >= disccount.minQuantity) {
                return Math.max(maxDiscount, disccount.disccountValue);
              }
            }
            return maxDiscount;
          }, 0),
          packings: quoteDetail.product.packings !== undefined
            ? quoteDetail.product.packings.map((packing: Packing) => {
              const packingVolume: number = (packing.height * packing.width * packing.height);
              const productQuantity: number = quoteDetail.quantities;
              const volumeWithQuantities: number = (packingVolume * productQuantity);

              const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

              const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                ? localTransportPrices.sort((a, b) => {
                  const diffA = Math.abs(a.volume - volumeWithQuantities);
                  const diffB = Math.abs(b.volume - volumeWithQuantities);
                  return diffA - diffB;
                })[0]
                : undefined;

              const { origin, destination, price, volume } = closestLocalTransportPrice;

              const transportCalculation = [{
                packingVolume,
                productQuantity,
                volumeWithQuantities
              }];

              return {
                unities: packing.unities,
                large: packing.large,
                width: packing.width,
                height: packing.height,
                smallPackingWeight: packing.smallPackingWeight,
                transportCalculation,
                localTransportPrice: {
                  origin,
                  destination,
                  price,
                  volume
                },
              };
            })
            : quoteDetail.product.refProduct.packings.map((packing: Packing) => {
              const packingVolume: number = (packing.height * packing.width * packing.height);
              const productQuantity: number = quoteDetail.quantities;
              const volumeWithQuantities: number = (packingVolume * productQuantity);

              const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

              const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                ? localTransportPrices.sort((a, b) => {
                  const diffA = Math.abs(a.volume - volumeWithQuantities);
                  const diffB = Math.abs(b.volume - volumeWithQuantities);
                  return diffA - diffB;
                })[0]
                : undefined;

              const { origin, destination, price, volume } = closestLocalTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

              const transportCalculation = [{
                packingVolume,
                productQuantity,
                volumeWithQuantities
              }];

              return {
                unities: packing.unities,
                large: packing.large,
                width: packing.width,
                height: packing.height,
                smallPackingWeight: packing.smallPackingWeight,
                transportCalculation,
                localTransportPrice: {
                  origin,
                  destination,
                  price,
                  volume
                },
              };
            }),
          variantReferences: quoteDetail.product.variantReferences.map((variantReference: VariantReference) => {
            return {
              name: variantReference.name,
            };
          }),
          markingServices: quoteDetail.markingServices.map((markingService: MarkingService) => {
            return {
              logo: markingService.logos.map((logo: Logo) => {
                return {
                  logo: logo.logo,
                  mounting: logo.mounting
                };
              }),
              calculatedMarkingPrice: markingService.calculatedMarkingPrice,
              markingTransportPrice: markingService.markingTransportPrice,
              marking: markingService.marking.name,
              externalSubTechnique: markingService.externalSubTechnique.name,
              markingServiceProperty: {
                name: markingService?.markingServiceProperty?.name,
                prices: (markingService?.markingServiceProperty?.markedServicePrices || [])
                  .slice()
                  .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
                  .map((markedServicePrice: MarkedServicePrice) => {
                    markingTotalPrice += markedServicePrice.unitPrice;

                    return {
                      markedServicePrice: markedServicePrice?.unitPrice || 0
                    };
                  }),
              },
            };
          }),
          markingTotalPrice,
        };
      }),
    };

    return {
      cartQuote: finalCartQuote
    };
  }


  async filterByClient(id: string, isCommercial: any) {
    let cartQuotes: CartQuote[] = [];

    const { isCommercial: isCommercialUser = 0 } = isCommercial;

    if (isCommercialUser == 1) {
      const commercialUser = await this.userRepository.findOne({
        where: {
          id,
          isActive: true,
        },
        relations: [
          'admin',
          'admin.clients',
          'admin.clients.user',
          'admin.clients.cartQuotes',
          'admin.clients.cartQuotes.client',
          'admin.clients.cartQuotes.client.user',
          'admin.clients.cartQuotes.user',
          'admin.clients.cartQuotes.user.company',
          'admin.clients.cartQuotes.state',
          'admin.clients.cartQuotes.quoteDetails',
          'admin.clients.cartQuotes.quoteDetails.transportServices',
          'admin.clients.cartQuotes.quoteDetails.product',
          'admin.clients.cartQuotes.quoteDetails.product.colors',
          'admin.clients.cartQuotes.quoteDetails.product.variantReferences',
          'admin.clients.cartQuotes.quoteDetails.product.images',
          'admin.clients.cartQuotes.quoteDetails.product.packings',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct.images',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct.packings',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct.supplier',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct.supplier.disccounts',
          'admin.clients.cartQuotes.quoteDetails.product.refProduct.supplier.disccounts.disccounts',
          'admin.clients.cartQuotes.quoteDetails.markingServices',
          'admin.clients.cartQuotes.quoteDetails.markingServices.logos',
          'admin.clients.cartQuotes.quoteDetails.markingServices.marking',
          'admin.clients.cartQuotes.quoteDetails.markingServices.externalSubTechnique',
          'admin.clients.cartQuotes.quoteDetails.markingServices.markingServiceProperty',
          'admin.clients.cartQuotes.quoteDetails.markingServices.markingServiceProperty.markedServicePrices',
        ],
      });

      if (!commercialUser)
        throw new NotFoundException(`Commercial user with ID ${id} not found.`);

      const clientsWithCartQuotes = commercialUser.admin.clients.map(client => {
        const clientInfo = classToPlain(client.user, { exposeDefaultValues: true });
        clientInfo.cartQuotes = client.cartQuotes.map(cartQuote => classToPlain(cartQuote, { exposeDefaultValues: true }));
        return clientInfo;
      });

      cartQuotes = clientsWithCartQuotes.flatMap(client => {
        return client.cartQuotes.map(cartQuote =>
          plainToClass(CartQuote, cartQuote)
        );
      });
    } else {
      cartQuotes = await this.cartQuoteRepository
        .createQueryBuilder('quote')
        .where('quote.isActive =:isActive', { isActive: true })
        .leftJoinAndSelect('quote.state', 'state')
        .leftJoinAndSelect('quote.client', 'client')
        .andWhere('client.id =:id', { id })
        .leftJoinAndSelect('client.user', 'user')
        .leftJoinAndSelect('user.company', 'company')
        .leftJoinAndSelect('quote.quoteDetails', 'quoteDetails')
        .leftJoinAndSelect('quoteDetails.transportServices', 'transportServices')
        .leftJoinAndSelect('quoteDetails.product', 'product')
        .leftJoinAndSelect('product.colors', 'colors')
        .leftJoinAndSelect('product.variantReferences', 'variantReferences')
        .leftJoinAndSelect('product.images', 'images')
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
        .getMany();
    }

    const localTransportPricesDb: LocalTransportPrice[] = await this.localTransportPriceRepository.find({
      where: {
        origin: 'Bogota',
      },
    });

    const result = await Promise.all(cartQuotes.map(async (cartQuote: CartQuote) => {
      let markingTotalPrice: number = 0;

      const brand: Brand = await this.brandRepository.findOne({
        where: {
          id: cartQuote.brandId,
        },
      });

      return {
        id: cartQuote.id,
        isActive: cartQuote.isActive,
        brand,
        quoteName: cartQuote.quoteName,
        description: cartQuote.description,
        client: cartQuote?.client || '',
        clientCompany: cartQuote?.client?.user?.company?.name,
        destinationCity: cartQuote.destinationCity,
        deliveryAddress: cartQuote.deliveryAddress,
        totalPrice: cartQuote.totalPrice,
        productsQuantity: cartQuote.productsQuantity,
        weightToOrder: cartQuote.weightToOrder,
        createdAt: cartQuote.createdAt,
        state: cartQuote.state?.name || '',
        products: cartQuote.quoteDetails.map((quoteDetail: QuoteDetail) => {
          return {
            name: quoteDetail.product.refProduct.name,
            discount: quoteDetail.discount,
            iva: quoteDetail.iva,
            subTotal: quoteDetail.subTotal,
            subTotalWithDiscount: quoteDetail.subTotalWithDiscount,
            totalValue: quoteDetail.totalValue,
            total: quoteDetail.total,
            unitPrice: quoteDetail.unitPrice,
            quantity: quoteDetail.quantities,
            image: quoteDetail.product?.refProduct?.images[0]?.url || 'default.png',
            color: quoteDetail.product?.colors[0]?.name || '',
            samplePrice: quoteDetail.product.samplePrice,
            refundSampleTime: quoteDetail.product.refundSampleTime,
            productIva: quoteDetail.product.iva,
            loanSample: quoteDetail.product.loanSample,
            // discount: quoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
            //   if (disccount.maxQuantity !== 0) {
            //     if (quoteDetail.quantities >= disccount.minQuantity && quoteDetail.quantities <= disccount.maxQuantity) {
            //       return Math.max(maxDiscount, disccount.disccountValue);
            //     }
            //   } else {
            //     if (quoteDetail.quantities >= disccount.minQuantity) {
            //       return Math.max(maxDiscount, disccount.disccountValue);
            //     }
            //   }
            //   return maxDiscount;
            // }, 0),
            packings: quoteDetail.product.packings !== undefined
              ? quoteDetail.product.packings.map((packing: Packing) => {
                const packingVolume: number = (packing.height * packing.width * packing.height);
                const productQuantity: number = quoteDetail.quantities;
                const volumeWithQuantities: number = (packingVolume * productQuantity);

                const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

                const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                  ? localTransportPrices.sort((a, b) => {
                    const diffA = Math.abs(a.volume - volumeWithQuantities);
                    const diffB = Math.abs(b.volume - volumeWithQuantities);
                    return diffA - diffB;
                  })[0]
                  : undefined;

                const { origin, destination, price, volume } = closestLocalTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

                const transportCalculation = [{
                  packingVolume,
                  productQuantity,
                  volumeWithQuantities
                }];

                return {
                  unities: packing.unities,
                  large: packing.large,
                  width: packing.width,
                  height: packing.height,
                  smallPackingWeight: packing.smallPackingWeight,
                  transportCalculation,
                  localTransportPrice: {
                    origin,
                    destination,
                    price,
                    volume
                  },
                };
              })
              : quoteDetail.product.refProduct.packings.map((packing: Packing) => {
                const packingVolume: number = (packing.height * packing.width * packing.height);
                const productQuantity: number = quoteDetail.quantities;
                const volumeWithQuantities: number = (packingVolume * productQuantity);

                const localTransportPrices: LocalTransportPrice[] = localTransportPricesDb.filter((localTransportPriceDb) => localTransportPriceDb.destination == cartQuote.destinationCity);

                const closestLocalTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
                  ? localTransportPrices.sort((a, b) => {
                    const diffA = Math.abs(a.volume - volumeWithQuantities);
                    const diffB = Math.abs(b.volume - volumeWithQuantities);
                    return diffA - diffB;
                  })[0]
                  : undefined;

                const { origin, destination, price, volume } = closestLocalTransportPrice;

                const transportCalculation = [{
                  packingVolume,
                  productQuantity,
                  volumeWithQuantities
                }];

                return {
                  unities: packing.unities,
                  large: packing.large,
                  width: packing.width,
                  height: packing.height,
                  smallPackingWeight: packing.smallPackingWeight,
                  transportCalculation,
                  localTransportPrice: {
                    origin,
                    destination,
                    price,
                    volume
                  },
                };
              }),
            variantReferences: quoteDetail.product.variantReferences.map((variantReference: VariantReference) => {
              return {
                name: variantReference?.name || '',
              };
            }),
            markingServices: quoteDetail?.markingServices?.map((markingService: MarkingService) => {
              return {
                logo: markingService?.logos?.map((logo: Logo) => {
                  return {
                    logo: logo?.logo || '',
                    mounting: logo?.mounting || ''
                  };
                }),
                calculatedMarkingPrice: markingService?.calculatedMarkingPrice || '',
                markingTransportPrice: markingService?.markingTransportPrice || '',
                marking: markingService?.marking?.name || '',
                externalSubTechnique: markingService?.externalSubTechnique?.name || '',
                markingServiceProperty: {
                  name: markingService?.markingServiceProperty?.name || '',
                  prices: (markingService.markingServiceProperty.markedServicePrices || [])
                    .slice()
                    .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
                    .map((markedServicePrice: MarkedServicePrice) => {
                      markingTotalPrice += markedServicePrice.unitPrice;

                      return {
                        markedServicePrice: markedServicePrice?.unitPrice || 0
                      };
                    }),
                },
              };
            }),
            markingTotalPrice,
          };
        }),
      };
    }));

    return {
      cartQuotes: result
    };
  }

  async update(id: string, updateCartQuoteDto: UpdateCartQuoteDto) {
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

  async changeStatus(id: string, updateCartQuoteDto: UpdateCartQuoteDto) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'quoteDetails',
        'quoteDetails.product',
        'quoteDetails.markingServices',
        'user',
        'client',
        'client.user',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    const state: State = await this.stateRepository.findOne({
      where: {
        id: updateCartQuoteDto.state,
      },
    });

    if (!state)
      throw new NotFoundException(`State with id ${updateCartQuoteDto.state} not found`);

    cartQuote.state = state;

    let purchaseOrderCreated: PurchaseOrder;

    if (state.name.toLowerCase() == 'aprobada' || state.name.toLowerCase() == 'rechazada') {
      const commercialUser: User = await this.userRepository.findOne({
        where: {
          id: updateCartQuoteDto.commercialUser,
        },
      });

      if (!commercialUser)
        throw new NotFoundException(`Commercial user with id ${updateCartQuoteDto.commercialUser} not found`);

      if (!commercialUser.isActive)
        throw new BadRequestException(`Commercial user with id ${updateCartQuoteDto.commercialUser} is currently inactive`);

      const currentCartQuoteUser: User = await this.userRepository.findOne({
        where: {
          id: cartQuote.user.id,
        },
      });

      if (!currentCartQuoteUser)
        throw new BadRequestException(`This cart quote does not have an user`);

      currentCartQuoteUser.cartQuotes = null;

      await this.userRepository.save(currentCartQuoteUser);

      cartQuote.user = commercialUser;
    };

    // if (updateCartQuoteDto.epaycoCode) {
    if (state.name.toLowerCase() == 'convertido en orden de compra') {
      const epaycoCode: string = updateCartQuoteDto.epaycoCode;

      const { data: { data: response } } = await axios.get(`https://secure.epayco.co/validation/v1/reference/8832fb2b46b346206f71a569`);

      const supplierPurchaseOrderState: State = await this.stateRepository
        .createQueryBuilder('state')
        .where('LOWER(state.name) =:name', { name: 'por solicitar' })
        .andWhere('LOWER(state.process) =:process', { process: 'orden de compra proveedor' })
        .getOne();

      if (!supplierPurchaseOrderState)
        throw new NotFoundException(`State for supplier purchase order not found`);

      const orderListDetailsCreated: OrderListDetail[] = [];

      const cartClient: Client = cartQuote.client;

      let orderListDetailState: State;

      if (cartClient.user.isCoorporative == 1) {
        orderListDetailState = await this.stateRepository
          .createQueryBuilder('state')
          .where('LOWER(state.name) =:name', { name: 'montaje aprobado' })
          .andWhere('LOWER(state.process) =:process', { process: 'order list es corporativo' })
          .getOne();
      } else {
        orderListDetailState = await this.stateRepository
          .createQueryBuilder('state')
          .where('LOWER(state.name) =:name', { name: 'pedido en producción' })
          .andWhere('LOWER(state.process) =:process', { process: 'order list es no corporativo' })
          .getOne();
      };

      for (const quoteDetail of cartQuote.quoteDetails) {
        const supplierPurchaseOrderData = {
          state: supplierPurchaseOrderState
        };

        const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrderData);

        let expirationDate: Date = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const orderListDetailData = {
          orderCode: uuidv4(),
          quantities: quoteDetail.quantities,
          productTotalPrice: quoteDetail.totalValue,
          clientTagTransportService: quoteDetail.transportServiceTagClient,
          // estimatedDeliveryDate: cartQuote.,
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
          supplierPurchaseOrder,
          state: orderListDetailState,
        };

        const orderListDetail: OrderListDetail = await plainToClass(OrderListDetail, orderListDetailData);

        orderListDetail.product = quoteDetail.product;
        orderListDetail.markingServices = quoteDetail.markingServices;

        const orderListDetailCreated: OrderListDetail = await this.orderListDetailRepository.save(orderListDetail);

        orderListDetailsCreated.push(orderListDetailCreated);
      };

      const stateToFind: string = cartQuote.user.isCoorporative ? 'preaprobada' : 'orden de compra realizada';

      const state: State = await this.stateRepository
        .createQueryBuilder('state')
        .where('LOWER(name) =:stateToFind', { stateToFind })
        .getOne();

      let expirationDate: Date = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const purchaseOrderData = {
        tagOrderNumber: uuidv4(),
        clientOrderNumber: uuidv4(),
        approvalDate: cartQuote.updatedAt,
        creationDate: cartQuote.createdAt,
        paymentDate: new Date(),
        userApproval: cartQuote.updatedBy,
        invoiceIssueDate: new Date(),
        invoiceDueDate: new Date(),
        financingCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.totalValue, 0),
        feeCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.aditionalClientFee, 0),
        retentionCost: cartQuote.quoteDetails.reduce((sum, quoteDetail) => sum + quoteDetail.withholdingAtSourceValue, 0),
        expirationDate,
        clientUser: cartQuote.client.id,
        commercialUser: cartQuote.updatedBy,
        value: cartQuote.totalPrice,
        state
      };

      const purchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, purchaseOrderData);

      purchaseOrder.orderListDetails = orderListDetailsCreated;

      purchaseOrderCreated = await this.purchaseOrderRepository.save(purchaseOrder);
    }
    // };

    await this.cartQuoteRepository.save(cartQuote);

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
