import { Injectable, NotFoundException, BadRequestException, ConsoleLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuote } from '../cart-quotes/entities/cart-quote.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingService } from '../marking-services/entities/marking-service.entity';
import { MarkedServicePrice } from '../marked-service-prices/entities/marked-service-price.entity';
import { Packing } from '../packings/entities/packing.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../markings/entities/marking.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { DeliveryTime } from '../delivery-times/entities/delivery-time.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';

@Injectable()
export class QuoteDetailsService {
  constructor(
    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) { }

  async create(createQuoteDetailDto: CreateQuoteDetailDto) {
    const hasSample: boolean = createQuoteDetailDto.hasSample;

    delete (createQuoteDetailDto.hasSample);

    const newQuoteDetail: QuoteDetail = plainToClass(QuoteDetail, createQuoteDetailDto);

    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: createQuoteDetailDto.cartQuote,
      },
      relations: [
        'client',
        'client.user',
        'client.user.company',
        'client.user.brands',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${createQuoteDetailDto} not found`);

    const product: Product = await this.productRepository.findOne({
      where: {
        id: createQuoteDetailDto.product,
      },
      relations: [
        'packings',
        'refProduct',
        'refProduct.packings',
        'refProduct.supplier',
        'refProduct.supplier.disccounts',
        'refProduct.supplier.disccounts.disccounts',
      ],
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createQuoteDetailDto.product} not found`);

    newQuoteDetail.cartQuote = cartQuote;
    newQuoteDetail.product = product;

    let markingTotalPrice: number = 0;

    if (createQuoteDetailDto?.markingServices || createQuoteDetailDto?.markingServices?.length > 0) {
      const markingServices: MarkingService[] = [];

      for (const markingServiceId of createQuoteDetailDto.markingServices) {
        const markingService: MarkingService = await this.markingServiceRepository.findOne({
          where: {
            id: markingServiceId,
          },
          relations: [
            'marking',
            'markingServiceProperty',
            'markingServiceProperty.markedServicePrices',
          ],
        });

        if (!markingService)
          throw new NotFoundException(`Marking service with id ${markingServiceId} not found`);

        if (!markingService.isActive)
          throw new BadRequestException(`Marking service with id ${markingServiceId} is currently inactive`);

        markingServices.push(markingService);
      }

      // markingServices.forEach((markingService: MarkingService) => {
      //   (markingService?.markingServiceProperty?.markedServicePrices || [])
      //     .slice()
      //     .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
      //     .map((markedServicePrice: MarkedServicePrice) => {
      //       markingTotalPrice += markedServicePrice.unitPrice;

      //       return {
      //         markedServicePrice: markedServicePrice?.unitPrice || 0
      //       };
      //     });
      // });

      newQuoteDetail.markingServices = markingServices;
      // newQuoteDetail.markingTotalPrice = markingTotalPrice;
    };

    // const discountProduct: number = newQuoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
    //   if (disccount.maxQuantity !== 0) {
    //     if (newQuoteDetail.quantities >= disccount.minQuantity && newQuoteDetail.quantities <= disccount.maxQuantity) {
    //       return Math.max(maxDiscount, disccount.disccountValue);
    //     }
    //   } else {
    //     if (newQuoteDetail.quantities >= disccount.minQuantity) {
    //       return Math.max(maxDiscount, disccount.disccountValue);
    //     }
    //   }
    //   return maxDiscount;
    // }, 0);

    // newQuoteDetail.sampleValue = product.samplePrice;
    // newQuoteDetail.totalValue = newQuoteDetail.unitPrice * newQuoteDetail.quantities;
    // newQuoteDetail.unitDiscount = newQuoteDetail.unitPrice * (discountProduct);
    // newQuoteDetail.subTotal = (newQuoteDetail.unitPrice * newQuoteDetail.quantities) + markingTotalPrice;

    // newQuoteDetail.discount =
    //   newQuoteDetail.unitPrice * (discountProduct / 100) * newQuoteDetail.quantities ||
    //   newQuoteDetail.unitPrice * (product.disccountPromo / 100) * newQuoteDetail.quantities || 0;

    // newQuoteDetail.subTotalWithDiscount =
    //   newQuoteDetail.subTotal - newQuoteDetail.discount ||
    //   newQuoteDetail.subTotal - product.disccountPromo || 0;

    // newQuoteDetail.iva =
    //   (newQuoteDetail.subTotalWithDiscount * (newQuoteDetail.iva / 100)) |
    //   (newQuoteDetail.subTotalWithDiscount * (product.iva / 100)) || 0;

    // newQuoteDetail.total = newQuoteDetail.subTotalWithDiscount + newQuoteDetail.iva || 0;

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: newQuoteDetail.cartQuote.id,
      }
    });

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${newQuoteDetail.cartQuote.id} not found`);

    cartQuoteDb.totalPrice += newQuoteDetail.total || 0;
    cartQuoteDb.productsQuantity += newQuoteDetail.quantities || 0;

    //* ------------- CALCULOS ------------- *//
    const quantity: number = newQuoteDetail.quantities || 0;
    let totalPrice: number = newQuoteDetail.unitPrice * quantity || 0;
    let totalTransportPrice: number = 0;
    let totalCost: number = 0;
    let productVolume: number = 0;
    let totalVolume: number = 0;

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
    const markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
    const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
      .getMany();

    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX

    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];

    //* -------------------------- INICIO DE CALCULOS -------------------------- *//
    //* CALCULAR EL VOLUMEN DEL PRODUCTO
    productVolume = (product?.height * product?.weight * product?.large) || 0;

    //* DATOS DEL CLIENTE
    const cartQuoteClient: Client = cartQuote?.client;
    const clientUser: User = cartQuote?.client?.user;
    let clientType: string = '';

    //* CANTIDAD QUEMADA EN QUOTE DETAIL
    const burnQuantity: number = newQuoteDetail?.unitPrice || 0;
    totalCost += burnQuantity;
    newQuoteDetail.transportTotalPrice = 0;

    //* SE SOLICITA MUESTRA
    if (hasSample) {
      //* CALCULAR EL PRECIO DE LA MUESTRA
      // let samplePrice: number = await this.calculateSamplePrice(newQuoteDetail, systemConfig, quantity) || 0;
      // newQuoteDetail.sampleValue = samplePrice;
      // totalPrice += samplePrice;

      // totalCost += samplePrice;

      const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;

      newQuoteDetail.sampleValue = 0;

      if (!productHasFreeSample) {
        const samplePrice: number = product?.samplePrice || 0;

        if (samplePrice <= 0) {
          const referencePrice: number = product?.referencePrice || 0;
          totalPrice += referencePrice;
          newQuoteDetail.sampleValue = referencePrice;
        };

        totalPrice += samplePrice;
        newQuoteDetail.sampleValue = samplePrice;

        if (newQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
          const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
            ? markingTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalVolume);
              const diffB = Math.abs(b.volume - totalVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

          totalPrice += clientTransportPrice;
          newQuoteDetail.transportTotalPrice = 0;
          newQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
          newQuoteDetail.sampleValue += clientTransportPrice || 0;
        } else {
          //TODO: FEDEX
          newQuoteDetail.transportTotalPrice += 20000;
        }
      };
    };

    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
    const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities) || 0;

    boxesQuantity = Math.round(boxesQuantity) + 1 || 0;

    //* CALCULAR EL VOLUMEN DEL PAQUETE
    const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
    totalVolume = (packingVolume * boxesQuantity) || 0;

    //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
    const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
    const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* COTIZAR SERVICIO DE MARCACIÓN
    const quoteDetailRefProduct: RefProduct = product.refProduct;

    const markingServices: MarkingService[] = newQuoteDetail?.markingServices || [];

    //* SI ES PERSONALIZABLE EL PRODUCTO

    if (quoteDetailRefProduct?.personalizableMarking == 1) {
      if (markingServices || markingServices.length > 0) {
        for (const markingService of markingServices) {
          let markingServicePropertyPrice: number = 0;

          const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;

          for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
            //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
            if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange <= quantity) {
              let totalMarking: number = (quantity * markedServicePrice.unitPrice);
              newQuoteDetail.markingTotalPrice = totalMarking;

              const marking: Marking = markingServiceProperty.externalSubTechnique.marking;

              //* SI EL SERVICIO DE MARCADO TIENE IVA
              if (marking.iva > 0) {
                //* CALCULAR EL IVA
                const iva: number = (marking.iva / 100) * totalMarking || 0;
                totalMarking += iva;
                totalCost += iva;
                newQuoteDetail.markingPriceWithIva = iva;

                //* CALCULAR EL 4X1000
                let value4x1000: number = totalMarking * 0.004 || 0;
                totalMarking += value4x1000;
                totalCost += value4x1000;
                newQuoteDetail.markingPriceWith4x1000 = value4x1000;
              };

              //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
              const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
              totalMarking += marginForDialingServices;

              //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
              markingService.markingTransportPrice = markingTransportPrice;
              totalMarking += markingTransportPrice;
              totalCost += markingTransportPrice;
              newQuoteDetail.markingWithProductSupplierTransport += markingTransportPrice;

              //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
              const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice || 0;
              totalMarking += supplierFinancingPercentage;

              markingService.markingTransportPrice = (markingTransportPrice + supplierFinancingPercentage) || 0;
              markingService.calculatedMarkingPrice = totalMarking;

              await this.markingServicePropertyRepository.save(markingService);
            };
          };
        };
      };
    };

    //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
    const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice || 0;
    totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage) || 0;

    newQuoteDetail.totalPriceWithTransport = (newQuoteDetail.unitPrice + totalTransportPrice) || 0;
    newQuoteDetail.transportTotalPrice += totalTransportPrice || 0;

    //* CALCULAR EL 4X1000 PARA PAGAR SERVICIOS DE ENTREGA
    let value4x1000: number = totalPrice * 0.004 || 0;
    totalPrice += value4x1000;
    totalCost += value4x1000;
    newQuoteDetail.transportServices4x1000 = value4x1000;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      totalPrice += mainClient?.margin;
    };

    totalPrice += cartQuote?.client?.margin || 0;

    //* SE DEBE ADICIONAR UN FEE ADICIONAL AL USUARIO DENTRO DEL CLIENTE
    if (clientUser) {
      if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
        clientType = 'cliente corporativo secundario';
      else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
        clientType = 'cliente corporativo principal';
    };

    if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
      const brandId: string = cartQuote.brandId;

      if (brandId != null || brandId.trim() != '' || brandId != undefined) {
        const cartQuoteBrand: Brand = await this.brandRepository.findOne({
          where: {
            id: brandId,
          },
        });

        if (!cartQuoteBrand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (cartQuote.client.user.brands.some(brand => brand.id == cartQuoteBrand.id)) {
          const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;

          totalPrice += fee;
          totalCost += fee;
          newQuoteDetail.aditionalClientFee = fee;
          cartQuote.fee = fee;
        };
      };
    };

    //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
    const profitMargin: number = 0;

    const paymentDays = [
      {
        day: 1,
        percentage: 0.03,
      },
      {
        day: 15,
        percentage: 0.03,
      },
      {
        day: 30,
        percentage: 0.03,
      },
      {
        day: 45,
        percentage: 0.04,
      },
      {
        day: 60,
        percentage: 0.06,
      },
      {
        day: 90,
        percentage: 0.09,
      },
    ];

    //* SI EL CLIENTE ES SECUNDARIO
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      const marginProfit: number = mainClient.margin || 0;
      const paymentTerms: number = mainClient.paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      // Precio original * (1 - Descuento individual) * (1 - Descuento general)

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SI EL CLIENTE ES PRINCIPAL
    if (clientType == 'cliente corporativo principal') {
      const margin: number = cartQuoteClient.margin || 0;
      const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
    newQuoteDetail.subTotal = totalPrice;

    //* PRECIO TOTAL ANTES DE IVA (YA HECHO)
    newQuoteDetail.totalValueWithoutIva = totalPrice;

    //* IVA DE LA VENTA
    const iva: number = (product.iva / 100) * totalPrice || 0;
    newQuoteDetail.iva = iva;
    totalPrice += iva;
    totalCost += iva;

    //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
    Math.round(newQuoteDetail.totalValue);

    //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE
    const withholdingAtSource: number = systemConfig.withholdingAtSource || 0;
    const withholdingAtSourceValue: number = (totalPrice * withholdingAtSource / 100) || 0;

    totalPrice += withholdingAtSourceValue;
    newQuoteDetail.withholdingAtSourceValue = withholdingAtSourceValue;
    totalCost += withholdingAtSourceValue;
    cartQuoteDb.withholdingAtSourceValue = withholdingAtSourceValue;

    //* CALCULAR UTILIDAD DEL NEGOCIO
    const businessUtility = (totalPrice - (totalCost - withholdingAtSourceValue)) || 0;
    newQuoteDetail.businessUtility = businessUtility;

    //* CALCULAR DESCUENTO
    const discount: number = (product.promoDisccount / 100) * newQuoteDetail.subTotal || 0;
    newQuoteDetail.discount = discount;

    //* CALCULAR SUBTOTAL CON DESCUENTO
    newQuoteDetail.subTotalWithDiscount = (newQuoteDetail.subTotal - discount) || 0;
    newQuoteDetail.totalCost = totalCost;
    newQuoteDetail.totalValue = totalPrice;

    //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
    const businessMarginProfit: number = (totalPrice - newQuoteDetail.totalValueWithoutIva);
    newQuoteDetail.businessMarginProfit = businessMarginProfit;
    cartQuoteDb.totalPrice += totalPrice;

    //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
    newQuoteDetail.maximumDiscount = 20;

    await this.cartQuoteRepository.save(cartQuoteDb);
    await this.quoteDetailRepository.save(newQuoteDetail);

    return {
      newQuoteDetail,
      cartQuoteDb
    };
  };

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.quoteDetailRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingServices',
      ],
    });
  }

  async findOne(id: string) {
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingServices',
      ],
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    return {
      quoteDetail
    };
  }

  async update(id: string, updateQuoteDetailDto: UpdateQuoteDetailDto) {
    const hasSample: boolean = updateQuoteDetailDto.hasSample;

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'cartQuote',
        'cartQuote.client',
        'cartQuote.client.user',
        'cartQuote.client.user.company',
        'cartQuote.client.user.brands',
        'product.packings',
        'product.refProduct',
        'product.refProduct.packings',
        'product.refProduct.supplier',
        'product.refProduct.supplier.disccounts',
        'product.refProduct.supplier.disccounts.disccounts',
        'markingServices',
        'markingServices.marking',
        'markingServices.markingServiceProperty',
        'markingServices.markingServiceProperty.markedServicePrices',
      ],
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, updateQuoteDetailDto);

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: quoteDetail.cartQuote.id,
      }
    });

    const product: Product = quoteDetail.product;
    const cartQuote: CartQuote = quoteDetail.cartQuote;

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${quoteDetail.cartQuote.id} not found`);

    cartQuoteDb.totalPrice += quoteDetail.total || 0;
    cartQuoteDb.productsQuantity += quoteDetail.quantities || 0;

    //* ------------- CALCULOS ------------- *//
    const quantity: number = updatedQuoteDetail.quantities || 0;
    let totalPrice: number = updatedQuoteDetail.unitPrice * quantity || 0;
    let totalTransportPrice: number = 0;
    let totalCost: number = 0;
    let productVolume: number = 0;
    let totalVolume: number = 0;

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
    const markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
    const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
      .getMany();

    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX

    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];

    //* -------------------------- INICIO DE CALCULOS -------------------------- *//
    //* CALCULAR EL VOLUMEN DEL PRODUCTO
    productVolume = (product?.height * product?.weight * product?.large) || 0;

    //* DATOS DEL CLIENTE
    const cartQuoteClient: Client = cartQuote?.client;
    const clientUser: User = cartQuote?.client?.user;
    let clientType: string = '';

    //* CANTIDAD QUEMADA EN QUOTE DETAIL
    const burnQuantity: number = updatedQuoteDetail?.unitPrice || 0;
    totalCost += burnQuantity;
    updatedQuoteDetail.transportTotalPrice = 0;

    //* SE SOLICITA MUESTRA
    if (hasSample == true) {
      //* CALCULAR EL PRECIO DE LA MUESTRA
      // let samplePrice: number = await this.calculateSamplePrice(updatedQuoteDetail, systemConfig, quantity) || 0;
      // updatedQuoteDetail.sampleValue = samplePrice;
      // totalPrice += samplePrice;

      // totalCost += samplePrice;

      const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;

      updatedQuoteDetail.sampleValue = 0;

      if (!productHasFreeSample) {
        const samplePrice: number = product?.samplePrice || 0;

        if (samplePrice <= 0) {
          const referencePrice: number = product?.referencePrice || 0;
          totalPrice += referencePrice;
          updatedQuoteDetail.sampleValue = referencePrice;
        };

        totalPrice += samplePrice;
        updatedQuoteDetail.sampleValue = samplePrice;

        if (updatedQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
          const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
            ? markingTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalVolume);
              const diffB = Math.abs(b.volume - totalVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

          totalPrice += clientTransportPrice;
          updatedQuoteDetail.transportTotalPrice = 0;
          updatedQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
          updatedQuoteDetail.sampleValue += clientTransportPrice || 0;
        } else {
          //TODO: FEDEX
          updatedQuoteDetail.transportTotalPrice += 20000;
        }
      };
    };

    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
    const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities) || 0;

    boxesQuantity = Math.round(boxesQuantity) + 1 || 0;

    //* CALCULAR EL VOLUMEN DEL PAQUETE
    const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
    totalVolume = (packingVolume * boxesQuantity) || 0;

    //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
    const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
    const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* COTIZAR SERVICIO DE MARCACIÓN
    const quoteDetailRefProduct: RefProduct = product.refProduct;

    const markingServices: MarkingService[] = updatedQuoteDetail?.markingServices || [];

    //* SI ES PERSONALIZABLE EL PRODUCTO

    if (quoteDetailRefProduct?.personalizableMarking == 1) {
      if (markingServices || markingServices.length > 0) {
        for (const markingService of markingServices) {
          let markingServicePropertyPrice: number = 0;

          const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;

          for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
            //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
            if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange <= quantity) {
              let totalMarking: number = (quantity * markedServicePrice.unitPrice);
              updatedQuoteDetail.markingTotalPrice = totalMarking;

              const marking: Marking = markingServiceProperty.externalSubTechnique.marking;

              //* SI EL SERVICIO DE MARCADO TIENE IVA
              if (marking.iva > 0) {
                //* CALCULAR EL IVA
                const iva: number = (marking.iva / 100) * totalMarking || 0;
                totalMarking += iva;
                totalCost += iva;
                updatedQuoteDetail.markingPriceWithIva = iva;

                //* CALCULAR EL 4X1000
                let value4x1000: number = totalMarking * 0.004 || 0;
                totalMarking += value4x1000;
                totalCost += value4x1000;
                updatedQuoteDetail.markingPriceWith4x1000 = value4x1000;
              };

              //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
              const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
              totalMarking += marginForDialingServices;

              //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
              markingService.markingTransportPrice = markingTransportPrice;
              totalMarking += markingTransportPrice;
              totalCost += markingTransportPrice;
              updatedQuoteDetail.markingWithProductSupplierTransport += markingTransportPrice;

              //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
              const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice || 0;
              totalMarking += supplierFinancingPercentage;

              markingService.markingTransportPrice = (markingTransportPrice + supplierFinancingPercentage) || 0;
              markingService.calculatedMarkingPrice = totalMarking;

              await this.markingServicePropertyRepository.save(markingService);
            };
          };
        };
      };
    };

    //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
    const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice || 0;
    totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage) || 0;

    updatedQuoteDetail.totalPriceWithTransport = (updatedQuoteDetail.unitPrice + totalTransportPrice) || 0;
    updatedQuoteDetail.transportTotalPrice += totalTransportPrice || 0;

    //* CALCULAR EL 4X1000 PARA PAGAR SERVICIOS DE ENTREGA
    let value4x1000: number = totalPrice * 0.004 || 0;
    totalPrice += value4x1000;
    totalCost += value4x1000;
    updatedQuoteDetail.transportServices4x1000 = value4x1000;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      totalPrice += mainClient?.margin;
    };

    totalPrice += cartQuote?.client?.margin || 0;

    //* SE DEBE ADICIONAR UN FEE ADICIONAL AL USUARIO DENTRO DEL CLIENTE
    if (clientUser) {
      if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
        clientType = 'cliente corporativo secundario';
      else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
        clientType = 'cliente corporativo principal';
    };

    if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
      const brandId: string = cartQuote.brandId;

      if (brandId != null || brandId.trim() != '' || brandId != undefined) {
        const cartQuoteBrand: Brand = await this.brandRepository.findOne({
          where: {
            id: brandId,
          },
        });

        if (!cartQuoteBrand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (cartQuote.client.user.brands.some(brand => brand.id == cartQuoteBrand.id)) {
          const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;

          totalPrice += fee;
          totalCost += fee;
          updatedQuoteDetail.aditionalClientFee = fee;
          cartQuote.fee = fee;
        };
      };
    };

    //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
    const profitMargin: number = 0;

    const paymentDays = [
      {
        day: 1,
        percentage: 3,
      },
      {
        day: 15,
        percentage: 3,
      },
      {
        day: 30,
        percentage: 3,
      },
      {
        day: 45,
        percentage: 4,
      },
      {
        day: 60,
        percentage: 6,
      },
      {
        day: 90,
        percentage: 9,
      },
    ];

    //* SI EL CLIENTE ES SECUNDARIO
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      const marginProfit: number = mainClient.margin || 0;
      const paymentTerms: number = mainClient.paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SI EL CLIENTE ES PRINCIPAL
    if (clientType == 'cliente corporativo principal') {
      const margin: number = cartQuoteClient.margin || 0;
      const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
    updatedQuoteDetail.subTotal = totalPrice;

    //* PRECIO TOTAL ANTES DE IVA (YA HECHO)
    updatedQuoteDetail.totalValueWithoutIva = totalPrice;

    //* IVA DE LA VENTA
    const iva: number = (product.iva / 100) * totalPrice || 0;
    updatedQuoteDetail.iva = iva;
    totalPrice += iva;
    totalCost += iva;

    //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
    Math.round(updatedQuoteDetail.totalValue);

    //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE
    const withholdingAtSource: number = systemConfig.withholdingAtSource || 0;
    const withholdingAtSourceValue: number = (withholdingAtSource / 100) * totalPrice || 0;

    totalPrice += withholdingAtSourceValue;
    updatedQuoteDetail.withholdingAtSourceValue = withholdingAtSourceValue;
    totalCost += withholdingAtSourceValue;
    cartQuoteDb.withholdingAtSourceValue = withholdingAtSourceValue;

    //* CALCULAR UTILIDAD DEL NEGOCIO
    const businessUtility = (totalPrice - (totalCost - withholdingAtSourceValue)) || 0;
    updatedQuoteDetail.businessUtility = businessUtility;

    //* CALCULAR DESCUENTO
    const discount: number = (product.promoDisccount / 100) * updatedQuoteDetail.subTotal || 0;
    updatedQuoteDetail.discount = discount;

    //* CALCULAR SUBTOTAL CON DESCUENTO
    updatedQuoteDetail.subTotalWithDiscount = (updatedQuoteDetail.subTotal - discount) || 0;
    updatedQuoteDetail.totalCost = totalCost;
    updatedQuoteDetail.totalValue = totalPrice;

    //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
    const businessMarginProfit: number = (totalPrice - updatedQuoteDetail.totalValueWithoutIva);
    updatedQuoteDetail.businessMarginProfit = businessMarginProfit;
    cartQuoteDb.totalPrice += totalPrice;

    //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
    updatedQuoteDetail.maximumDiscount = 20;

    Object.assign(quoteDetail, updatedQuoteDetail);

    // await this.cartQuoteRepository.save(cartQuoteDb);
    // await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail,
      cartQuoteDb
    };
  }

  async desactivate(id: string) {
    const { quoteDetail } = await this.findOne(id);

    quoteDetail.isActive = !quoteDetail.isActive;

    await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail
    };
  }

  async remove(id: string) {
    const { quoteDetail } = await this.findOne(id);

    await this.quoteDetailRepository.remove(quoteDetail);

    return {
      quoteDetail
    };
  }

  async calculateSamplePrice(data: QuoteDetail, systemConfig: SystemConfig, quantity: number) {
    const newQuoteDetail: QuoteDetail = data;
    const product: Product = newQuoteDetail.product;
    let samplePrice: number = product.samplePrice || 0;

    //* CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
    const packing: Packing = product.packings[0] || undefined;
    const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    let totalPackingVolume: number = 0;
    let packingWeight: number = 0;

    if (packingUnities > 0 && packingUnities != undefined) {
      let boxesQuantity: number = (quantity / packingUnities);

      boxesQuantity = Math.round(boxesQuantity) + 1;

      //* CALCULAR EL VOLUMEN DEL PAQUETE
      const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
      const totalVolume: number = (packingVolume * boxesQuantity) || 0;
      totalPackingVolume = totalVolume || 0;

      //* CALCULAR EL PESO DEL PAQUETE
      packingWeight = (packing?.smallPackingWeight * boxesQuantity) || 0;
    }

    //* APLICAR IVA
    if (product.iva > 0 || product.iva != undefined) {
      const iva: number = (product.iva / 100) * samplePrice;

      samplePrice += iva;
    };

    //* VERIFICAR SI ES IMPORTADO NACIONAL
    if (product.importedNational.toLowerCase() == 'importado') {
      const importationFee: number = (systemConfig.importationFee / 100) * samplePrice;

      samplePrice += importationFee;
    };

    //* VERIFICAR SI TIENE FEE DE IMPREVISTOS
    if (product.unforeseenFee > 0) {
      const unforeseenFee: number = (product.unforeseenFee / 100) * samplePrice;

      samplePrice += unforeseenFee;
    };

    const unforeseenFee: number = systemConfig.unforeseenFee || 0;
    const unforeseenFeePercentage: number = (unforeseenFee / 100) * samplePrice || 0;
    samplePrice += unforeseenFeePercentage;

    //TODO: Validar calculos de ganacias por periodos y politicas de tienpos de entrega
    //TODO: Después del margen del periodo validar del comercial


    //* IDENTIFICAR TIEMPO DE ENTREGA ACORDE AL PRODUCTO
    const availableUnits: number = product?.availableUnit || 0;
    let deliveryTimeToSave: number = 0;

    if (quantity > availableUnits) {
      product.refProduct.deliveryTimes.forEach((deliveryTime: DeliveryTime) => {
        if (deliveryTime?.minimum >= quantity && deliveryTime?.minimumAdvanceValue == 1 && deliveryTime?.maximum <= quantity || deliveryTime?.minimum >= quantity && deliveryTime?.minimumAdvanceValue == 0) {
          deliveryTimeToSave = deliveryTime?.timeInDays || 0;
          return;
        }
      });
    } else if (availableUnits > 0 && quantity < availableUnits) {
      deliveryTimeToSave = product?.refProduct?.productInventoryLeadTime || 0;
    };

    //* IDENTIFICAR PORCENTAJE DE ANTICIPIO DE PROVEEDOR
    const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
    samplePrice += advancePercentage;

    //* CALCULAR COSTOS FINANCIEROS DEL PERIODO DE PRODUCCIÓN
    const supplierFinancingPercentage: number = systemConfig.supplierFinancingPercentage || 0;
    const financingCost: number = ((samplePrice - advancePercentage) * supplierFinancingPercentage) * deliveryTimeToSave;
    samplePrice += financingCost;

    //* OBTENER LOS PRECIOS LOCALES DE TRANSPORTE
    let localTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
    const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
      ? localTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalPackingVolume);
        const diffB = Math.abs(b.volume - totalPackingVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

    samplePrice += transportPrice;

    //TODO: ASIGNAR EL VALOR DEL PRECIO DEL TRANSPORTE A ALGO

    //* CALCULAR EL IMPUESTO 4 X 1000
    samplePrice += (samplePrice * 1.04);

    //* CALCULAR EL COSTO DE LA OPERACIÓN (YA HECHO)

    //* ADICIONAR EL % DE MARGEN DE GANANCIA SOBRE EL PROVEEDOR
    samplePrice += product?.refProduct?.supplier?.profitMargin || 0;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DEL PRODUCTO
    const mainCategory: CategorySupplier = await this.categorySupplierRepository.findOne({
      where: {
        id: product?.refProduct?.mainCategory,
      },
    });

    if (mainCategory) {
      samplePrice += +mainCategory?.categoryTag?.categoryMargin || 0;
    };

    const clientCompanyDestination: string = newQuoteDetail?.cartQuote?.client?.user?.company?.city;

    //* SI EL DESTINO ES BOGOTÁ
    if (clientCompanyDestination.toLowerCase().trim() != 'bogota') {
      //TODO: HACER CALCULO DE FEDEX

    } else {
      samplePrice += transportPrice;
    };

    return samplePrice;
  }
}