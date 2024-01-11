import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { MarkedServicePrice } from 'src/marked-service-prices/entities/marked-service-price.entity';
import { Packing } from '../packings/entities/packing.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../markings/entities/marking.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';

@Injectable()
export class QuoteDetailsService {
  constructor(
    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

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
    const newQuoteDetail: QuoteDetail = plainToClass(QuoteDetail, createQuoteDetailDto);

    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: createQuoteDetailDto.cartQuote,
      },
      relations: [
        'client',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${createQuoteDetailDto} not found`);

    const product: Product = await this.productRepository.findOne({
      where: {
        id: createQuoteDetailDto.product,
      },
      relations: [
        'refProduct',
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

    if (createQuoteDetailDto.markingServices) {
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

      markingServices.forEach((markingService: MarkingService) => {
        (markingService?.markingServiceProperty?.markedServicePrices || [])
          .slice()
          .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
          .map((markedServicePrice: MarkedServicePrice) => {
            markingTotalPrice += markedServicePrice.unitPrice;

            return {
              markedServicePrice: markedServicePrice?.unitPrice || 0
            };
          });
      });

      newQuoteDetail.markingServices = markingServices;
      newQuoteDetail.markingTotalPrice = markingTotalPrice;
    };

    const discountProduct: number = newQuoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
      if (disccount.maxQuantity !== 0) {
        if (newQuoteDetail.quantities >= disccount.minQuantity && newQuoteDetail.quantities <= disccount.maxQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      } else {
        if (newQuoteDetail.quantities >= disccount.minQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      }
      return maxDiscount;
    }, 0);

    newQuoteDetail.sampleValue = product.samplePrice;
    newQuoteDetail.totalValue = newQuoteDetail.unitPrice * newQuoteDetail.quantities;
    newQuoteDetail.unitDiscount = newQuoteDetail.unitPrice * (discountProduct);
    newQuoteDetail.subTotal = (newQuoteDetail.unitPrice * newQuoteDetail.quantities) + markingTotalPrice;

    newQuoteDetail.discount =
      newQuoteDetail.unitPrice * (discountProduct / 100) * newQuoteDetail.quantities |
      newQuoteDetail.unitPrice * (product.disccountPromo / 100) * newQuoteDetail.quantities | 0;

    newQuoteDetail.subTotalWithDiscount =
      newQuoteDetail.subTotal - newQuoteDetail.discount |
      newQuoteDetail.subTotal - product.disccountPromo | 0;

    newQuoteDetail.iva =
      (newQuoteDetail.subTotalWithDiscount * (newQuoteDetail.iva / 100)) |
      (newQuoteDetail.subTotalWithDiscount * (product.iva / 100)) | 0;

    newQuoteDetail.total = newQuoteDetail.subTotalWithDiscount + newQuoteDetail.iva | 0;

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: newQuoteDetail.cartQuote.id,
      }
    });

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${newQuoteDetail.cartQuote.id} not found`);

    cartQuoteDb.totalPrice += newQuoteDetail.total;
    cartQuoteDb.productsQuantity += newQuoteDetail.quantities;

    //* ------------- CALCULOS ------------- *//
    const quantity: number = newQuoteDetail.quantities;
    let totalPrice: number = newQuoteDetail.unitPrice * quantity;
    let totalTransportPrice: number = 0;

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

    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];

    //* SE SOLICITA MUESTRA
    if (product.freeSample == 1) {
      //* CALCULAR EL PRECIO DE LA MUESTRA
      let samplePrice: number = product.samplePrice;

      //* CALCULAR EL VOLUMEN DEL PRODUCTO
      productVolume = (product?.height * product?.weight * product?.large) || 0;
    };

    //* CALCULAR LA CANTIDAD DE EMPAQUES PARA LAS UNIDADES COTIZADAS

    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings[0] || undefined;
    const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities);

    boxesQuantity = Math.round(boxesQuantity) + 1;

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

    const markingServices: MarkingService[] = newQuoteDetail.markingServices;

    if (quoteDetailRefProduct.personalizableMarking == 1) {
      //* CALCULA EL COSTO DEL SERVICIO DE MARCADO COMPARANDO LA LISTA DE PRECIOS Y LOS PARÁMETROS
      for (const markingService of markingServices) {
        let markingServicePropertyPrice: number = 0;

        const markingServiceProperty: MarkingServiceProperty = markingService.markingServiceProperty;

        for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
          //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
          if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange <= quantity) {
            let totalMarking: number = (quantity * markedServicePrice.unitPrice);

            const marking: Marking = markingServiceProperty.externalSubTechnique.marking;

            //* CALCULAR EL IVA DEL SERVICIO MARCADO
            if (marking.iva > 0) {
              const iva: number = (marking.iva / 100) * totalMarking;

              totalMarking += iva;
            };

            //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
            const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking;
            totalMarking += marginForDialingServices;

            //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
            markingService.markingTransportPrice = markingTransportPrice;

            totalMarking += markingTransportPrice;

            //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
            const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice;
            totalMarking += supplierFinancingPercentage;

            markingService.markingTransportPrice = (markingTransportPrice + supplierFinancingPercentage);
            markingService.calculatedMarkingPrice = totalMarking;

            await this.markingServicePropertyRepository.save(markingService);
          };
        };
      };
    };

    //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
    const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice;
    totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage);

    newQuoteDetail.totalPriceWithTransport = (newQuoteDetail.unitPrice + totalTransportPrice);
    newQuoteDetail.transportTotalPrice = totalTransportPrice;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
    totalPrice += cartQuote.client.margin;

    //TODO: SE DEBE ADICIONAR UN FEE ADICIONAL AL USUARIO DENTRO DEL CLIENTE
    //TODO: SE CALCULA Y ADICIONA UN FEE POR USUARIO DEL CLIENTE

    //TODO: ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE

    //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
    newQuoteDetail.subTotal = totalPrice;

    //* PRECIO TOTAL ANTES DE IVA (YA HECHO)

    //* IVA DE LA VENTA
    const iva: number = (product.iva / 100) * totalPrice;
    newQuoteDetail.iva += iva;
    newQuoteDetail.total = (totalPrice + iva);

    //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
    Math.round(newQuoteDetail.total);

    //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE


    //* CALCULAR UTILIDAD DEL NEGOCIO


    //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL

    //* CALCULAR DESCUENTO
    const discount: number = (product.disccountPromo / 100) * newQuoteDetail.subTotal;
    newQuoteDetail.discount = discount;

    //* CALCULAR SUBTOTAL CON DESCUENTO
    newQuoteDetail.subTotalWithDiscount = (newQuoteDetail.subTotal - discount);


    await this.cartQuoteRepository.save(cartQuoteDb);
    await this.quoteDetailRepository.save(newQuoteDetail);

    return {
      newQuoteDetail
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
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, updateQuoteDetailDto);

    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: updateQuoteDetailDto.cartQuote,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${updateQuoteDetailDto} not found`);

    const product = await this.productRepository.findOne({
      where: {
        id: updateQuoteDetailDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${updateQuoteDetailDto.product} not found`);

    updatedQuoteDetail.cartQuote = cartQuote;
    updatedQuoteDetail.product = product;

    const discountProduct: number = updatedQuoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
      if (disccount.maxQuantity !== 0) {
        if (updatedQuoteDetail.quantities >= disccount.minQuantity && updatedQuoteDetail.quantities <= disccount.maxQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      } else {
        if (updatedQuoteDetail.quantities >= disccount.minQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      }
      return maxDiscount;
    }, 0);

    updatedQuoteDetail.sampleValue = product.samplePrice;
    updatedQuoteDetail.totalValue = updatedQuoteDetail.unitPrice * updatedQuoteDetail.quantities;
    updatedQuoteDetail.unitDiscount = updatedQuoteDetail.unitPrice * (discountProduct);
    updatedQuoteDetail.subTotal = updatedQuoteDetail.unitPrice * updatedQuoteDetail.quantities + updatedQuoteDetail.markingTotalPrice;
    updatedQuoteDetail.discount = updatedQuoteDetail.unitPrice * (discountProduct / 100) * updatedQuoteDetail.quantities | 0;

    updatedQuoteDetail.subTotalWithDiscount = updatedQuoteDetail.subTotal - updatedQuoteDetail.discount;
    updatedQuoteDetail.iva = (updatedQuoteDetail.subTotalWithDiscount * (updatedQuoteDetail.iva / 100));
    updatedQuoteDetail.total = updatedQuoteDetail.subTotalWithDiscount + updatedQuoteDetail.iva;

    Object.assign(quoteDetail, updatedQuoteDetail);

    await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail
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
}
