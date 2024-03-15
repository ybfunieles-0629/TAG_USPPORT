import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { RefProduct } from './entities/ref-product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';
import { VariantReference } from '../variant-reference/entities/variant-reference.entity';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { DeliveryTime } from '../delivery-times/entities/delivery-time.entity';
import { FilterRefProductsDto } from './dto/filter-ref-products.dto';
import { CategoryTag } from '../category-tag/entities/category-tag.entity';
import { SupplierPrice } from '../supplier-prices/entities/supplier-price.entity';
import { ListPrice } from '../list-prices/entities/list-price.entity';
import { Disccount } from '../disccount/entities/disccount.entity';
import { Disccounts } from '../disccounts/entities/disccounts.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { Packing } from '../packings/entities/packing.entity';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';
import { User } from '../users/entities/user.entity';
import { Color } from '../colors/entities/color.entity';
import { Role } from '../roles/entities/role.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class RefProductsService {
  private readonly logger: Logger = new Logger('RefProductsService');

  constructor(
    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,

    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,

    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,

    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  async create(createRefProductDto: CreateRefProductDto, user: User) {
    const { height, large, width } = createRefProductDto;

    const volume: number = (height * large * width);

    const newRefProduct = plainToClass(RefProduct, createRefProductDto);

    newRefProduct.createdBy = user.id;

    newRefProduct.volume = volume;

    const joinedKeywords: string = createRefProductDto.keywords.join(';') + ';';

    newRefProduct.keywords = joinedKeywords;

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: createRefProductDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Suppplier with id ${createRefProductDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${createRefProductDto.supplier} is currently inactive`);

    const categorySuppliers: CategorySupplier[] = [];
    const categoryTags: CategoryTag[] = [];
    const deliveryTimes: DeliveryTime[] = [];
    const variantReferences: VariantReference[] = [];

    if (createRefProductDto.categorySuppliers) {
      for (const categorySupplierId of createRefProductDto.categorySuppliers) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: categorySupplierId,
          },
        });

        if (!categorySupplier)
          throw new NotFoundException(`Category supplier with id ${categorySupplierId} not found`);

        if (!categorySupplier.isActive)
          throw new BadRequestException(`Category supplier with id ${categorySupplierId} is currently inactive`);

        categorySuppliers.push(categorySupplier);
      }
    }

    if (createRefProductDto.categoryTags) {
      for (const categoryTagId of createRefProductDto.categoryTags) {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: categoryTagId,
          },
        });

        if (!categoryTag)
          throw new NotFoundException(`Category tag with id ${categoryTagId} not found`);

        if (!categoryTag.isActive)
          throw new BadRequestException(`Category tag with id ${categoryTagId} is currently inactive`);

        categoryTags.push(categoryTag);
      }
    }

    if (createRefProductDto.colors) {
      const colors: Color[] = [];

      for (const colorId of createRefProductDto.colors) {
        const color: Color = await this.colorRepository.findOne({
          where: {
            id: colorId,
          },
        });

        if (!color)
          throw new NotFoundException(`Color with id ${colorId} not found`);

        // if (!color.isActive)
        //   throw new BadRequestException(`Color with id ${colorId} is currently inactive`);

        colors.push(color);
      }

      newRefProduct.colors = colors;
    };

    if (createRefProductDto.variantReferences) {
      for (const variantReferenceId of createRefProductDto.variantReferences) {
        const variantReference: VariantReference = await this.variantReferenceRepository.findOne({
          where: {
            id: variantReferenceId,
          },
        });

        if (!variantReference)
          throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

        // if (!variantReference.isActive)
        //   throw new BadRequestException(`Variant reference with id ${variantReferenceId} is currently inactive`);

        variantReferences.push(variantReference);
      }
    }

    if (createRefProductDto.markingServiceProperty) {
      const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
        where: {
          id: createRefProductDto.markingServiceProperty,
        },
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Marking service properties with id ${createRefProductDto.markingServiceProperty} not found`);

      // if (!markingServiceProperty.isActive)
      //   throw new BadRequestException(`Variant reference with id ${markingServicePropertyId} is currently inactive`);

      newRefProduct.markingServiceProperty = markingServiceProperty;
    }

    if (createRefProductDto.deliveryTimes) {
      for (const deliveryTimeId of createRefProductDto.deliveryTimes) {
        const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
          where: {
            id: deliveryTimeId,
          },
        });

        if (!deliveryTime)
          throw new NotFoundException(`Delivery time with id ${deliveryTimeId} not found`);

        // if (!markingServiceProperty.isActive)
        //   throw new BadRequestException(`Variant reference with id ${markingServicePropertyId} is currently inactive`);

        deliveryTimes.push(deliveryTime);
      }
    }

    newRefProduct.categorySuppliers = categorySuppliers;
    // newRefProduct.categoryTags = categoryTags;
    newRefProduct.deliveryTimes = deliveryTimes;
    newRefProduct.variantReferences = variantReferences;
    newRefProduct.supplier = supplier;

    await this.refProductRepository.save(newRefProduct);

    return {
      newRefProduct
    };
  }

  async calculations(results: RefProduct[], margin: number, clientId: string, tipo=false) {

    let staticQuantities: number[];
    if(tipo){
       staticQuantities  = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
        150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000,
        7000, 8000, 9000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
        100000, 200000,
      ];
    }else{
      staticQuantities = [1];
    }
    



    // let staticQuantities: number[] = [1, 2];


    const clientSended: Client = await this.clientRepository.findOne({
      where: {
        id: clientId,
      },
      relations: [
        'user',
        'user.company',
      ],
    });

    const clientUser: User = clientSended?.user;

    let clientType: string = '';

    //* SE DEBE VERIFICAR SI EL USUARIO ES COORPORATIVO O QUÉ
    if (clientUser) {
      if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
        clientType = 'cliente corporativo secundario';
      else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
        clientType = 'cliente corporativo principal';
    };

    let mainClient: Client;

    if (clientType == 'cliente corporativo secundario') {
      mainClient = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();
    }

    const systemConfigs: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigs[0];

    const localTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    const finalResults = await Promise.all(results.map(async (result) => {
      const modifiedProducts = await Promise.all(result.products.map(async (product) => {
        const burnPriceTable = [];

        const initialValue: number = product.referencePrice;
        let changingValue: number = initialValue;

        for (let i = 0; i < staticQuantities.length; i++) {
          let prices = {
            quantity: staticQuantities[i],
            value: changingValue,
            totalValue: 0,
            transportPrice: 0,
          };

          const percentageDiscount: number = 0.01;

          let value: number = changingValue * (1 - percentageDiscount);

          value = Math.round(value);

          changingValue = value;

          //* SI EL PRODUCTO NO TIENE UN PRECIO NETO
          if (product.hasNetPrice == 0) {
            //* SI EL PRODUCTO TIENE UN PRECIO PROVEEDOR ASOCIADO
            if (product.supplierPrices.length > 0) {
              const supplierPrice: SupplierPrice = product.supplierPrices[0];

              //* RECORRO LA LISTA DE PRECIOS DEL PRECIO DEL PROVEEDOR
              // supplierPrice.listPrices.forEach((listPrice: ListPrice) => {
              //   if (listPrice.minimun >= i && listPrice.nextMinValue == 1 && listPrice.maximum <= i || listPrice.minimun >= i && listPrice.nextMinValue == 0) {
              //     //* SI APLICA PARA TABLA DE PRECIOS DE PROVEEDOR
              //     value += listPrice.price;
              //     return;
              //   };
              // });
            } else {

              //* SI LO ENCUENTRA LO AÑADE, SINO LE PONE UN 0 Y NO AÑADE NADA
              const entryDiscount: number = product.entryDiscount || 0;
              const entryDiscountValue: number = (entryDiscount / 100) * value || 0;
              value -= entryDiscountValue;

              //* BUSCO DESCUENTO PROMO
              const promoDiscount: number = product.promoDisccount || 0;
              const promoDiscountPercentage: number = (promoDiscount / 100) * value || 0;
              value -= promoDiscountPercentage;

              // //* APLICAR DESCUENTO POR MONTO
              if (product?.refProduct?.supplier?.disccounts != undefined) {
                if (product?.refProduct?.supplier?.disccounts?.length > 0) {
                  product?.refProduct?.supplier?.disccounts?.forEach((discountItem: Disccount) => {

                    //* SI EL DESCUENTO ES DE TIPO MONTO
                    if (discountItem.disccountType.toLowerCase() == 'descuento de monto') {
                      //* SI EL DESCUENTO TIENE DESCUENTO DE ENTRADA
                      if (discountItem.entryDisccount != undefined || discountItem.entryDisccount != null || discountItem.entryDisccount > 0) {
                        const discount: number = (discountItem.entryDisccount / 100) * value;
                        value -= discount;

                        return;
                      };

                      discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                        if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                          const discount: number = (listDiscount.disccountValue / 100) * value;
                          value -= discount;

                          return;
                        };
                      });
                    };
                  });
                } else {
                  if (product?.refProduct?.supplier?.disccounts != undefined) {
                    product?.refProduct?.supplier?.disccounts?.forEach((discountItem: Disccount) => {
                      //* SI EL DESCUENTO ES DE TIPO MONTO
                      if (discountItem.disccountType.toLowerCase() == 'descuento por cantidad') {
                        //* SI EL DESCUENTO TIENE DESCUENTO DE ENTRADA
                        if (discountItem.entryDisccount != undefined || discountItem.entryDisccount != null || discountItem.entryDisccount > 0) {
                          const discount: number = (discountItem.entryDisccount / 100) * value;
                          value -= discount;

                          return;
                        };

                        discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                          if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                            const discount: number = (listDiscount.disccountValue / 100) * value;
                            value -= discount;

                            return;
                          };
                        });
                      };
                    });
                  };
                };
              };
            };
          }

          // //* ADICIONAR EL MARGEN DE GANANCIA DEL CLIENTE
          if (clientSended) {
            if (margin > 0) {
              const marginValueResult: number = (margin / 100) * value;
              value += marginValueResult;
              //   //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
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
                const marginProfit: number = mainClient.margin || 0;
                const paymentTerms: number = mainClient.paymentTerms || 0;

                let percentageDiscount: number = 0;

                paymentDays.forEach(paymentDay => {
                  if (paymentDay.day == paymentTerms) {
                    percentageDiscount = paymentDay.percentage;
                  };
                });

                let result: number = value * (1 - percentageDiscount);
                value += Math.round(result);
              };

              //* SI EL CLIENTE ES PRINCIPAL
              if (clientType == 'cliente corporativo principal') {
                const margin: number = clientSended.margin || 0;
                const paymentTerms: number = clientSended.paymentTerms || 0;

                let percentageDiscount: number = 0;

                paymentDays.forEach(paymentDay => {
                  if (paymentDay.day == paymentTerms) {
                    percentageDiscount = paymentDay.percentage;
                  };
                });

                let result: number = value * (1 - percentageDiscount);
                value += Math.round(result);
              };

              const marginPercentage: number = +margin;
              const finalMarginValue: number = (marginPercentage / 100) * value;

              value += finalMarginValue;
            };

            //* IVA
            const iva: number = (product.iva / 100) * value;
            value += iva;
          };

          // //* APLICAR IVA
          if (product.iva > 0 || product.iva != undefined) {
            const iva: number = (product.iva / 100) * value;

            value += iva;
          };

          // //* VERIFICAR SI ES IMPORTADO NACIONAL
          if (product.importedNational.toLowerCase() == 'importado') {
            const importationFee: number = (systemConfig.importationFee / 100) * value;

            value += importationFee;
          };

          // //* VERIFICAR SI TIENE FEE DE IMPREVISTOS
          if (product.unforeseenFee > 0) {
            const unforeseenFee: number = (product.unforeseenFee / 100) * value;

            value += unforeseenFee;
          } else {
            const unforeseenFee: number = systemConfig.unforeseenFee;
            const unforeseenFeePercentage: number = (unforeseenFee / 100) * value;
            value += unforeseenFeePercentage;
          }

          // //TODO: Validar calculos de ganacias por periodos y politicas de tienpos de entrega
          // //TODO: Después del margen del periodo validar del comercial
          // //* IDENTIFICAR PORCENTAJE DE ANTICIPIO DE PROVEEDOR
          const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
          const advancePercentageValue: number = (advancePercentage / 100) * value;
          value += advancePercentageValue;

          // //* CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
          const packing: Packing = product.packings[0] || undefined;
          const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

          let totalPackingVolume: number = 0;
          let packingWeight: number = 0;

          if (packingUnities > 0 && packingUnities != undefined) {
            let boxesQuantity: number = (i / packingUnities);

            boxesQuantity = Math.round(boxesQuantity) + 1;

            //   //* CALCULAR EL VOLUMEN DEL PAQUETE
            const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
            const totalVolume: number = (packingVolume * boxesQuantity) || 0;
            totalPackingVolume = totalVolume || 0;

            //   //* CALCULAR EL PESO DEL PAQUETE
            packingWeight = (packing?.smallPackingWeight * boxesQuantity) || 0;
          }

          // //* IDENTIFICAR TIEMPO DE ENTREGA ACORDE AL PRODUCTO
          const availableUnits: number = product?.availableUnit || 0;
          let deliveryTimeToSave: number = 0;

          if (i > availableUnits) {
            product.refProduct.deliveryTimes.forEach((deliveryTime: DeliveryTime) => {
              if (deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 1 && deliveryTime?.maximum <= i || deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 0) {
                deliveryTimeToSave = deliveryTime?.timeInDays || 0;
              }
            });
          } else if (availableUnits > 0 && i < availableUnits) {
            deliveryTimeToSave = product?.refProduct?.productInventoryLeadTime || 0;
          };

          //* CALCULAR COSTOS FINANCIEROS DEL PERIODO DE PRODUCCIÓN
          const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage) || 0;
          const financingCost: number = ((value - advancePercentageValue));
          const supplierFinancingPercentageValue: number = (supplierFinancingPercentage / 100) * financingCost;
          value = (value - supplierFinancingPercentageValue) * deliveryTimeToSave;

          //* CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
          const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
            ? localTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalPackingVolume);
              const diffB = Math.abs(b.volume - totalPackingVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

          value += transportPrice;

          prices.transportPrice = transportPrice;

          //* CALCULAR EL IMPUESTO 4 X 1000
          const fourPercentage = (value * 0.004);
          value += fourPercentage;

          //* CALCULAR EL COSTO DE LA OPERACIÓN (YA HECHO)

          //* ADICIONAR EL % DE MARGEN DE GANANCIA SOBRE EL PROVEEDOR
          const profitMargin: number = product?.refProduct?.supplier?.profitMargin || 0;
          const profitMarginPercentage: number = (profitMargin / 100) * value;
          value += profitMarginPercentage;

          //* ADICIONAR EL % DE MARGEN DE GANANCIA DEL PRODUCTO
          const mainCategory: CategoryTag = await this.categoryTagRepository.findOne({
            where: {
              id: product?.refProduct?.tagCategory,
            },
          });

          if (mainCategory) {
            const categoryMarginValue: number = (+mainCategory.categoryMargin / 100) * value;
            value += categoryMarginValue;
          };

          //* PRECIO TOTAL ANTES DEL IVA (YA HECHO)
          const productIvaValue: number = (product.iva / 100) * value;
          value += productIvaValue;

          //* CALCULAR EL PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
          value = Math.round(value);

          //* IVA ADICIONAL
          const additionalProductIvaValue: number = (product.iva / 100) * value;
          value += additionalProductIvaValue;

          prices.totalValue = value;
          burnPriceTable.push(prices);
        }

        return { ...product, burnPriceTable };
      }));

      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          id: result.mainCategory,
        },
      });

      if (!categorySupplier)
        throw new NotFoundException(`Category supplier with id ${result.mainCategory} not found`);

      return { ...result, isPending: 1, products: modifiedProducts, mainCategory: categorySupplier };
    }));

    return finalResults;
  };

  async findAll(paginationDto: PaginationDto, user: User) {
    const totalCount = await this.refProductRepository.count();

    const { limit = 10, offset = 0, calculations = 0, supplier = 0, dashboard = 1, margin = 0, clientId = '' } = paginationDto;

    let results: RefProduct[] = [];

    if (user.roles.some((role: Role) => role.name.toLowerCase().trim() == 'proveedor')) {
      if (dashboard == 1) {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .leftJoinAndSelect('rp.supplier', 'rpSupplier')
          .where('rpSupplier.id =:userId', { userId: user.id })
          .leftJoinAndSelect('rp.images', 'rpImages')
          .leftJoinAndSelect('rp.colors', 'rpColors')
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .leftJoinAndSelect('rp.deliveryTimes', 'rpDeliveryTimes')
          .leftJoinAndSelect('rp.markingServiceProperty', 'rpMarkingServiceProperty')
          .leftJoinAndSelect('rpMarkingServiceProperty.externalSubTechnique', 'rpExternalSubTechnique')
          .leftJoinAndSelect('rpExternalSubTechnique.marking', 'rpMarking')
          .leftJoinAndSelect('rp.packings', 'rpPackings')
          .take(limit)
          .skip(offset)
          .getMany();
      } else {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .where('rp.weight > :weight', { weight: 0 })
          .andWhere('rp.height > :height', { height: 0 })
          .andWhere('rp.width > :width', { width: 0 })
          .andWhere('rp.large > :large', { large: 0 })
          .leftJoinAndSelect('rp.supplier', 'supplier')
          .leftJoinAndSelect('rp.images', 'rpImages')
          .leftJoinAndSelect('rp.colors', 'rpColors')
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .leftJoinAndSelect('rp.deliveryTimes', 'rpDeliveryTimes')
          .leftJoinAndSelect('rp.markingServiceProperty', 'rpMarkingServiceProperty')
          .leftJoinAndSelect('rpMarkingServiceProperty.externalSubTechnique', 'rpExternalSubTechnique')
          .leftJoinAndSelect('rpExternalSubTechnique.marking', 'rpMarking')
          .leftJoinAndSelect('rp.packings', 'rpPackings')
          .leftJoinAndSelect('rp.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.disccounts', 'productDisccounts')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.supplierPrices', 'productSupplierPrices')
          .leftJoinAndSelect('productSupplierPrices.product', 'productSupplierPricesProduct')
          .leftJoinAndSelect('productSupplierPrices.listPrices', 'productSupplierPricesListPrices')
          .leftJoinAndSelect('product.markingServiceProperties', 'productMarkingServiceProperties')
          .leftJoinAndSelect('productMarkingServiceProperties.images', 'productMarkingServicePropertiesImages')
          .leftJoinAndSelect('productMarkingServiceProperties.externalSubTechnique', 'productMarkingServicePropertiesExternalSubTechnique')
          .leftJoinAndSelect('productMarkingServicePropertiesExternalSubTechnique.marking', 'productMarkingServicePropertiesExternalSubTechniqueMarking')
          .leftJoinAndSelect('supplier.user', 'supplierUser')
          .take(limit)
          .skip(offset)
          .getMany();
      }

    } else {
      results = await this.refProductRepository
        .createQueryBuilder('rp')
        // .where('rp.weight > :weight', { weight: 0 })
        // .andWhere('rp.height > :height', { height: 0 })
        // .andWhere('rp.width > :width', { width: 0 })
        // .andWhere('rp.large > :large', { large: 0 })
        .leftJoinAndSelect('rp.supplier', 'supplier')
        .leftJoinAndSelect('rp.images', 'rpImages')
        .leftJoinAndSelect('rp.colors', 'rpColors')
        .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
        .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
        .leftJoinAndSelect('rp.deliveryTimes', 'rpDeliveryTimes')
        .leftJoinAndSelect('rp.markingServiceProperty', 'rpMarkingServiceProperty')
        .leftJoinAndSelect('rpMarkingServiceProperty.externalSubTechnique', 'rpExternalSubTechnique')
        .leftJoinAndSelect('rpExternalSubTechnique.marking', 'rpMarking')
        .leftJoinAndSelect('rp.packings', 'rpPackings')
        .leftJoinAndSelect('rp.products', 'product')
        .where('product.weight > :weight', { weight: 0 })
        .andWhere('product.height > :height', { height: 0 })
        .andWhere('product.width > :width', { width: 0 })
        .andWhere('product.large > :large', { large: 0 })
        .leftJoinAndSelect('product.images', 'productImages')
        .leftJoinAndSelect('product.disccounts', 'productDisccounts')
        .leftJoinAndSelect('product.refProduct', 'productRefProduct')
        .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
        .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
        .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
        .leftJoinAndSelect('product.colors', 'productColors')
        .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
        .leftJoinAndSelect('product.packings', 'productPackings')
        .leftJoinAndSelect('product.supplierPrices', 'productSupplierPrices')
        .leftJoinAndSelect('productSupplierPrices.product', 'productSupplierPricesProduct')
        .leftJoinAndSelect('productSupplierPrices.listPrices', 'productSupplierPricesListPrices')
        .leftJoinAndSelect('product.markingServiceProperties', 'productMarkingServiceProperties')
        .leftJoinAndSelect('productMarkingServiceProperties.images', 'productMarkingServicePropertiesImages')
        .leftJoinAndSelect('productMarkingServiceProperties.externalSubTechnique', 'productMarkingServicePropertiesExternalSubTechnique')
        .leftJoinAndSelect('productMarkingServicePropertiesExternalSubTechnique.marking', 'productMarkingServicePropertiesExternalSubTechniqueMarking')
        .leftJoinAndSelect('supplier.user', 'supplierUser')
        .take(limit)
        .skip(offset)
        .getMany();
    };

    const finalResults: RefProduct[] = results;
    let finalCalculatedResults = [];
    let finalFinalResults = [];

    if (calculations == 1) {
      const calculatedResults = results.length > 0 ? await this.calculations(results, margin, clientId) : [];
      finalCalculatedResults = calculatedResults;
    }

    if (finalCalculatedResults.length > 0) {
      finalFinalResults = await Promise.all(finalCalculatedResults.map(async (result) => {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: result.tagCategory,
          },
        });

        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: result.mainCategory,
          },
        });

        return {
          ...result,
          tagCategory: categoryTag,
          mainCategory: categorySupplier
        }
      }));
    } else if (finalResults.length > 0) {
      finalFinalResults = await Promise.all(finalResults.map(async (result) => {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: result.tagCategory,
          },
        });

        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: result.mainCategory,
          },
        });

        return {
          ...result,
          tagCategory: categoryTag,
          mainCategory: categorySupplier,
        }
      }));
    }

    return {
      totalCount,
      results: finalFinalResults,
    };
  }


  async filterProductsWithDiscount(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, margin, clientId = '' } = paginationDto;

    const results: RefProduct[] = await this.refProductRepository
      .createQueryBuilder('refProduct')
      .where('refProduct.weight > :weight', { weight: 0 })
      .andWhere('refProduct.height > :height', { height: 0 })
      .andWhere('refProduct.width > :width', { width: 0 })
      .andWhere('refProduct.large > :large', { large: 0 })
      .leftJoinAndSelect('refProduct.products', 'product')
      .where('product.weight > :weight', { weight: 0 })
      .andWhere('product.height > :height', { height: 0 })
      .andWhere('product.width > :width', { width: 0 })
      .andWhere('product.large > :large', { large: 0 })
      .leftJoinAndSelect('refProduct.images', 'refProductImages')
      .leftJoinAndSelect('refProduct.colors', 'refProductColors')
      .leftJoinAndSelect('refProduct.categorySuppliers', 'refProductCategorySuppliers')
      .leftJoinAndSelect('refProduct.categoryTags', 'refProductCategoryTags')
      .leftJoinAndSelect('refProduct.deliveryTimes', 'refProductDeliveryTimes')
      .leftJoinAndSelect('refProduct.markingServiceProperty', 'refProductMarkingServiceProperty')
      .leftJoinAndSelect('refProductMarkingServiceProperty.externalSubTechnique', 'refProductExternalSubTechnique')
      .leftJoinAndSelect('refProductExternalSubTechnique.marking', 'refProductExternalSubTechniqueMarking')
      .leftJoinAndSelect('refProduct.packings', 'refProductPackings')
      .leftJoinAndSelect('product.refProduct', 'productRefProduct')
      .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
      .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
      .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
      .leftJoinAndSelect('product.colors', 'productColors')
      .leftJoinAndSelect('product.disccounts', 'productsDisccounts')
      .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
      .leftJoinAndSelect('product.packings', 'productPackings')
      .leftJoinAndSelect('product.supplierPrices', 'productSupplierPrices')
      .leftJoinAndSelect('productSupplierPrices.listPrices', 'productSupplierPricesListPrices')
      .leftJoinAndSelect('product.markingServiceProperties', 'productMarkingServiceProperties')
      .leftJoinAndSelect('productMarkingServiceProperties.images', 'productMarkingServicePropertiesImages')
      .leftJoinAndSelect('productMarkingServiceProperties.externalSubTechnique', 'productMarkingServicePropertiesExternalSubTechnique')
      .leftJoinAndSelect('productMarkingServicePropertiesExternalSubTechnique.marking', 'productMarkingServicePropertiesExternalSubTechniqueMarking')
      .leftJoinAndSelect('refProduct.supplier', 'refProductSupplier')
      .leftJoinAndSelect('refProductSupplier.user', 'refProductSupplierUser')
      .leftJoinAndSelect('refProduct.variantReferences', 'refProductVariantReferences')
      .take(limit)
      .skip(offset)
      .getMany();

    const finalResults = results.length > 0 ? await this.calculations(results, margin, clientId, true) : [];

    return {
      totalCount: finalResults.length,
      results: finalResults
    };
  };

  async findOne(id: string, margin: number, clientId: string) {
    const refProduct: RefProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'images',
        'colors',
        'categorySuppliers',
        'categoryTags',
        'deliveryTimes',
        'markingServiceProperty',
        'markingServiceProperty.externalSubTechnique',
        'markingServiceProperty.externalSubTechnique.marking',
        'packings',
        'products',
        'products.images',
        'products.disccounts',
        'products.refProduct',
        'products.refProduct.deliveryTimes',
        'products.refProduct.supplier',
        'products.refProduct.supplier.disccounts',
        'products.colors',
        'products.variantReferences',
        'products.packings',
        'products.supplierPrices',
        'products.supplierPrices.product',
        'products.supplierPrices.listPrices',
        'products.markingServiceProperties',
        'products.markingServiceProperties.images',
        'products.markingServiceProperties.externalSubTechnique',
        'products.markingServiceProperties.externalSubTechnique.marking',
        'supplier',
        'supplier.user',
        'variantReferences',
      ],
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    const refProducts: RefProduct[] = [];

    refProducts.push(refProduct);

    const finalResults = refProducts.length > 0 ? await this.calculations(refProducts, margin, clientId, true) : [];

    const finalFinalResults = await Promise.all(finalResults.map(async (refProduct) => {
      const tagCategory: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          id: refProduct.tagCategory,
        },
      });

      return {
        ...refProduct,
        tagCategory
      }
    }));

    return {
      finalResults: finalFinalResults
    };
  }

  async filterProductsBySupplier(id: string, paginationDto: PaginationDto) {
    let count: number = 0;
    let { limit = count, offset = 0 } = paginationDto;

    const refProducts: RefProduct[] = await this.refProductRepository
      .createQueryBuilder('refProduct')
      .where('refProduct.weight > :weight', { weight: 0 })
      .andWhere('refProduct.height > :height', { height: 0 })
      .andWhere('refProduct.width > :width', { width: 0 })
      .andWhere('refProduct.large > :large', { large: 0 })
      .leftJoinAndSelect('refProduct.products', 'product')
      .where('product.weight > :weight', { weight: 0 })
      .andWhere('product.height > :height', { height: 0 })
      .andWhere('product.width > :width', { width: 0 })
      .andWhere('product.large > :large', { large: 0 })
      .leftJoinAndSelect('product.packings', 'productPackings')
      .leftJoinAndSelect('product.colors', 'productColors')
      .leftJoinAndSelect('refProduct.images', 'refProductImages')
      .leftJoinAndSelect('refProduct.colors', 'refProductColors')
      .leftJoinAndSelect('refProduct.categorySuppliers', 'refProductCategorySuppliers')
      .leftJoinAndSelect('refProduct.categoryTags', 'refProductCategoryTags')
      .leftJoinAndSelect('refProduct.deliveryTimes', 'refProductDeliveryTimes')
      .leftJoinAndSelect('refProduct.markingServiceProperty', 'refProductMarkingServiceProperty')
      .leftJoinAndSelect('refProduct.variantReferences', 'refProductVariantReferences')
      .leftJoinAndSelect('refProductMarkingServiceProperty.externalSubTechnique', 'refProductExternalSubTechnique')
      .leftJoinAndSelect('refProductExternalSubTechnique.marking', 'refProductExternalSubTechniqueMarking')
      .leftJoinAndSelect('refProduct.packings', 'refProductPackings')
      .leftJoinAndSelect('refProduct.supplier', 'refProductSupplier')
      .where('refProductSupplier.id =:supplierId', { supplierId: id })
      .leftJoinAndSelect('refProductSupplier.user', 'refProductSupplierUser')
      .take(limit)
      .skip(offset)
      .getMany();

    count += refProducts.length;
    limit = count;

    return {
      count,
      refProducts
    };
  };

  async filterProducts(filterRefProductsDto: FilterRefProductsDto, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, margin, clientId } = paginationDto;

    let refProductsToShow: RefProduct[] = [];

    if (filterRefProductsDto.categoryTag) {
      for (const categoryTagId of filterRefProductsDto.categoryTag) {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: categoryTagId,
          },
          relations: [
            'categorySuppliers',
          ],
        });

        if (!categoryTag) {
          throw new NotFoundException(`Category tag with id ${categoryTagId} not found`);
        }

        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.images', 'images')
          .where('refProduct.tagCategory = :categoryTagId', { categoryTagId })
          .orWhere('refProduct.mainCategory = :categoryTagId', { categoryTagId })
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .orWhere('categorySuppliers.id =:categoryTagId', { categoryTagId })
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .orWhere('categoryTags.id =:categoryTagId', { categoryTagId })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.products', 'products')
          .where('products.weight > :weight', { weight: 0 })
          .andWhere('products.height > :height', { height: 0 })
          .andWhere('products.width > :width', { width: 0 })
          .andWhere('products.large > :large', { large: 0 })
          .leftJoinAndSelect('products.colors', 'colors')
          .leftJoinAndSelect('products.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('products.variantReferences', 'variantReferences')
          .leftJoinAndSelect('products.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('products.packings', 'productPackings')
          .leftJoinAndSelect('products.markingServiceProperties', 'productMarkingServiceProperties')
          .leftJoinAndSelect('productMarkingServiceProperties.images', 'productMarkingServicePropertiesImages')
          .leftJoinAndSelect('productMarkingServiceProperties.externalSubTechnique', 'productExternalSubTechnique')
          .leftJoinAndSelect('productExternalSubTechnique.marking', 'productExternalSubTechniqueMarking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'supplierUser')
          .leftJoinAndSelect('refProduct.variantReferences', 'refProductVariantReferences')
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    }

    if (filterRefProductsDto.prices) {
      const [minPrice, maxPrice]: number[] = filterRefProductsDto.prices;

      if (refProductsToShow.length > 0) {
        const filteredRefProducts = refProductsToShow
          .filter((refProduct: RefProduct) => {
            if (
              refProduct.products &&
              refProduct.products.some(
                (product) => product.referencePrice >= minPrice && product.referencePrice <= maxPrice
              )
            ) {
              return true;
            }
            return false;
          });

        refProductsToShow = filteredRefProducts;
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .where('product.referencePrice BETWEEN :minPrice AND :maxPrice', {
            minPrice,
            maxPrice,
          })
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    };

    if (filterRefProductsDto.budget) {
      const budget: number = filterRefProductsDto.budget;

      if (refProductsToShow.length > 0) {
        const filteredRefProducts = refProductsToShow
          .filter((refProduct: RefProduct) => {
            if (
              refProduct.products &&
              refProduct.products.some(
                (product) => product.referencePrice <= budget
              )
            ) {
              return true;
            }
            return false;
          });

        refProductsToShow = filteredRefProducts;
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .andWhere('product.referencePrice <= :budget', { budget })
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    };

    if (filterRefProductsDto.inventory) {
      const inventory: number = filterRefProductsDto.inventory;

      if (refProductsToShow.length > 0) {
        const filteredRefProducts = refProductsToShow
          .filter((refProduct: RefProduct) => {
            if (
              refProduct.products &&
              refProduct.products.some(
                (product) => product.availableUnit === inventory
              )
            ) {
              return true;
            }
            return false;
          });

        refProductsToShow = filteredRefProducts;
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .select(['refProduct.id', 'SUM(product.availableUnit) AS totalAvailableUnit'])
          .groupBy('refProduct.id')
          .having('totalAvailableUnit < :inventory', { inventory })
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    };

    if (filterRefProductsDto.colors) {
      const colorIds: string[] = filterRefProductsDto.colors;

      if (refProductsToShow.length > 0) {
        const filteredRefProducts = refProductsToShow
          .filter((refProduct: RefProduct) => {
            if (
              refProduct.products &&
              refProduct.products.some(
                (product) => product.colors.some((color) => color.id && colorIds.includes(color.id))
              )
            ) {
              return true;
            }
            return false;
          });

        refProductsToShow = filteredRefProducts;
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .andWhere('productColors.id IN (:...colorIds)', { colorIds })
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    };

    if (filterRefProductsDto.variantReferences) {
      const variantReferences: string[] = filterRefProductsDto.variantReferences;

      if (refProductsToShow.length > 0) {
        const filteredRefProducts = refProductsToShow
          .filter((refProduct: RefProduct) => {
            if (
              refProduct.products &&
              refProduct.products.some(
                (product) =>
                  product.variantReferences &&
                  product.variantReferences.some(
                    (variantRef: VariantReference) => variantReferences.includes(variantRef.id)
                  )
              )
            ) {
              return true;
            }
            return false;
          });

        refProductsToShow = filteredRefProducts;
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .andWhere('productVariantReferences.id IN (:...variantReferences)', { variantReferences })
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    };

    if (filterRefProductsDto.isNew) {
      const isNew: boolean = filterRefProductsDto.isNew;

      if (isNew) {
        if (refProductsToShow.length > 0) {
          refProductsToShow.forEach((refProduct: RefProduct) => {
            if (refProduct.products && refProduct?.products?.length > 0) {
              refProduct.products.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
            }
          });
        } else {
          const refProducts: RefProduct[] = await this.refProductRepository
            .createQueryBuilder('refProduct')
            .where('refProduct.weight > :weight', { weight: 0 })
            .andWhere('refProduct.height > :height', { height: 0 })
            .andWhere('refProduct.width > :width', { width: 0 })
            .andWhere('refProduct.large > :large', { large: 0 })
            .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
            .leftJoinAndSelect('refProduct.colors', 'refProductColors')
            .leftJoinAndSelect('refProduct.packings', 'packings')
            .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
            .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
            .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
            .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
            .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
            .leftJoinAndSelect('refProduct.supplier', 'supplier')
            .leftJoinAndSelect('supplier.user', 'user')
            .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
            .leftJoinAndSelect('refProduct.images', 'images')
            .leftJoinAndSelect('refProduct.products', 'product')
            .where('product.weight > :weight', { weight: 0 })
            .andWhere('product.height > :height', { height: 0 })
            .andWhere('product.width > :width', { width: 0 })
            .andWhere('product.large > :large', { large: 0 })
            .leftJoinAndSelect('product.images', 'productImages')
            .leftJoinAndSelect('product.colors', 'productColors')
            .leftJoinAndSelect('product.refProduct', 'productRefProduct')
            .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
            .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
            .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
            .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
            .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
            .leftJoinAndSelect('product.packings', 'productPackings')
            .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
            .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
            .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
            .orderBy('product.createdAt', 'DESC')
            .getMany();

          refProductsToShow.push(...refProducts);
        };
      }
    };

    if (filterRefProductsDto.hasDiscount) {
      const hasDiscount: boolean = filterRefProductsDto.hasDiscount;

      if (hasDiscount) {
        if (refProductsToShow.length > 0) {
          refProductsToShow.forEach((refProduct: RefProduct) => {
            if (refProduct.products && refProduct.products.length > 0) {
              refProduct.products.sort((a, b) => b.promoDisccount - a.promoDisccount);
            }
          });
        } else {
          const refProducts: RefProduct[] = await this.refProductRepository
            .createQueryBuilder('refProduct')
            .where('refProduct.weight > :weight', { weight: 0 })
            .andWhere('refProduct.height > :height', { height: 0 })
            .andWhere('refProduct.width > :width', { width: 0 })
            .andWhere('refProduct.large > :large', { large: 0 })
            .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
            .leftJoinAndSelect('refProduct.colors', 'refProductColors')
            .leftJoinAndSelect('refProduct.packings', 'packings')
            .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
            .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
            .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
            .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
            .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
            .leftJoinAndSelect('refProduct.supplier', 'supplier')
            .leftJoinAndSelect('supplier.user', 'user')
            .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
            .leftJoinAndSelect('refProduct.images', 'images')
            .leftJoinAndSelect('refProduct.products', 'product')
            .where('product.weight > :weight', { weight: 0 })
            .andWhere('product.height > :height', { height: 0 })
            .andWhere('product.width > :width', { width: 0 })
            .andWhere('product.large > :large', { large: 0 })
            .leftJoinAndSelect('product.images', 'productImages')
            .leftJoinAndSelect('product.colors', 'productColors')
            .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
            .leftJoinAndSelect('product.refProduct', 'productRefProduct')
            .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
            .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
            .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
            .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
            .leftJoinAndSelect('product.packings', 'productPackings')
            .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
            .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
            .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
            .orderBy('product.promoDisccount', 'DESC')
            .getMany();

          refProductsToShow.push(...refProducts);
        }
      };
    };

    if (filterRefProductsDto.isAsc) {
      const isAsc: boolean = filterRefProductsDto.isAsc;

      if (refProductsToShow.length > 0) {
        if (isAsc) {
          refProductsToShow.sort((a, b) => {
            const priceA = a.products[0]?.referencePrice || 0;
            const priceB = b.products[0]?.referencePrice || 0;
            return priceA - priceB;
          });
        } else {
          refProductsToShow.sort((a, b) => {
            const priceA = a.products[0]?.referencePrice || 0;
            const priceB = b.products[0]?.referencePrice || 0;
            return priceB - priceA;
          });
        }
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .orderBy('product.referencePrice', 'ASC')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .getMany();

        refProductsToShow.push(...refProducts);
      };
    };

    if (filterRefProductsDto.keywords) {
      const searchKeywords: string = filterRefProductsDto.keywords.toLowerCase();
      const keywordsArray: string[] = searchKeywords.split(' ');

      if (refProductsToShow.length > 0) {
        refProductsToShow = refProductsToShow.filter((refProduct) => {
          const productKeywords: string = (refProduct.keywords || '').toLowerCase();
          const productName: string = (refProduct.name || '').toLowerCase();
          const productDescription: string = (refProduct.description || '').toLowerCase();
          const productShortDescription: string = (refProduct.shortDescription || '').toLowerCase();

          return keywordsArray.some(keyword =>
            productKeywords.includes(keyword) ||
            productName.includes(keyword) ||
            productDescription.includes(keyword) ||
            productShortDescription.includes(keyword)
          );
        });
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .where('product.weight > :weight', { weight: 0 })
          .andWhere('product.height > :height', { height: 0 })
          .andWhere('product.width > :width', { width: 0 })
          .andWhere('product.large > :large', { large: 0 })
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.refProduct', 'productRefProduct')
          .leftJoinAndSelect('productRefProduct.deliveryTimes', 'productRefProductDeliveryTimes')
          .leftJoinAndSelect('productRefProduct.supplier', 'productRefProductSupplier')
          .leftJoinAndSelect('productRefProductSupplier.disccounts', 'productRefProductSupplierDisccounts')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .where(
            keywordsArray.map(keyword =>
              `(LOWER(refProduct.keywords) LIKE :keyword OR LOWER(refProduct.name) LIKE :keyword OR LOWER(refProduct.description) LIKE :keyword OR LOWER(refProduct.shortDescription) LIKE :keyword)`
            ).join(' OR '),
            { keyword: `%${searchKeywords}%` }
          )
          .getMany();

        refProductsToShow.push(...refProducts);
      }
    }

    refProductsToShow = refProductsToShow.filter((refProduct) => refProduct.products.length > 0);

    const calculatedResults = refProductsToShow?.length > 0 ? await this.calculations(refProductsToShow, margin, clientId) : [];

    const finalResults = await Promise.all(calculatedResults.map(async (result) => {
      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          id: result.mainCategory.id,
        },
      });

      if (!categorySupplier)
        throw new NotFoundException(`Category supplier with id ${result.mainCategory} not found`);

      const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          id: result.tagCategory,
        },
      });

      return {
        ...result,
        isPending: 1,
        mainCategory: categorySupplier,
        tagCategory: categoryTag,
      };
    }));

    const paginatedRefProducts = finalResults.slice(offset, offset + limit);
    const finalRefProducts = await paginatedRefProducts.filter((refProduct) => refProduct?.images?.length > 0);

    return {
      count: finalRefProducts?.length,
      refProducts: finalRefProducts,
    };
  }

  async filterReferencesByIsAllowed(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const refProducts: RefProduct[] = await this.refProductRepository.find({
      relations: [
        'images',
        'colors',
        'categorySuppliers',
        'deliveryTimes',
        'markingServiceProperty',
        'markingServiceProperty.externalSubTechnique',
        'markingServiceProperty.externalSubTechnique.marking',
        'packings',
        'products',
        'products.colors',
        'products.variantReferences',
        'products.packings',
        'products.markingServiceProperties',
        'products.markingServiceProperties.images',
        'products.markingServiceProperties.externalSubTechnique',
        'products.markingServiceProperties.externalSubTechnique.marking',
        'supplier',
        'supplier.user',
        'variantReferences',
      ],
    });

    const refProductsToShow = [];

    for (const refProduct of refProducts) {
      if (refProduct.isAllowed === 0 || refProduct.products.some(product => product.isAllowed === 0)) {
        refProductsToShow.push({
          ...refProduct,
          isPending: 0,
          isPendingRef: refProduct.isAllowed == 0 ? 0 : 1,
          products: refProduct.products.map((product) => {
            if (product.isAllowed === 0) {
              return {
                isPendingProd: product.isAllowed === 0 ? 0 : 1,
                ...product,
              };
            };
          }),
        });
      }
    };

    const paginatedRefProducts: RefProduct[] = refProductsToShow.slice(offset, offset + limit);

    return {
      count: paginatedRefProducts.length,
      paginatedRefProducts
    };
  }

  async update(id: string, updateRefProductDto: UpdateRefProductDto, user: User) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'categorySuppliers',
        'colors',
        'deliveryTimes',
        'markingServiceProperty',
        'markingServiceProperty.externalSubTechnique',
        'markingServiceProperty.externalSubTechnique.marking',
        'packings',
        'products',
        'products.colors',
        'products.variantReferences',
        'products.packings',
        'products.markingServiceProperties',
        'products.markingServiceProperties.images',
        'products.markingServiceProperties.externalSubTechnique',
        'products.markingServiceProperties.externalSubTechnique.marking',
        'supplier',
        'supplier.user',
        'variantReferences',
      ],
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    const updatedRefProduct = plainToClass(RefProduct, updateRefProductDto);

    updatedRefProduct.updatedBy = user.id;

    if (updateRefProductDto.keywords) {
      const joinedKeywords: string = updateRefProductDto.keywords.join(';') + ';';

      updatedRefProduct.keywords = joinedKeywords;
    }

    if (updateRefProductDto.supplier) {
      const supplier: Supplier = await this.supplierRepository.findOne({
        where: {
          id: updateRefProductDto.supplier,
        },
      });

      if (!supplier)
        throw new NotFoundException(`Suppplier with id ${updateRefProductDto.supplier} not found`);

      if (!supplier.isActive)
        throw new BadRequestException(`Supplier with id ${updateRefProductDto.supplier} is currently inactive`);


      updatedRefProduct.supplier = supplier;
    }

    if (updateRefProductDto.categorySuppliers) {
      const categorySuppliers: CategorySupplier[] = [];

      for (const categorySupplierId of updateRefProductDto.categorySuppliers) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: categorySupplierId,
          },
        });

        if (!categorySupplier)
          throw new NotFoundException(`Category supplier with id ${categorySupplierId} not found`);

        if (!categorySupplier.isActive)
          throw new BadRequestException(`Category supplier with id ${categorySupplierId} is currently inactive`);

        categorySuppliers.push(categorySupplier);
      }

      updatedRefProduct.categorySuppliers = categorySuppliers;
    }

    if (updateRefProductDto.categoryTags) {
      const categoryTags: CategoryTag[] = [];

      for (const categoryTagId of updateRefProductDto.categoryTags) {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: categoryTagId,
          },
        });

        if (!categoryTag)
          throw new NotFoundException(`Category tag with id ${categoryTagId} not found`);

        if (!categoryTag.isActive)
          throw new BadRequestException(`Category tag with id ${categoryTagId} is currently inactive`);

        categoryTags.push(categoryTag);
      };

      updatedRefProduct.categoryTags = categoryTags;
    }

    if (updateRefProductDto.variantReferences) {
      const variantReferences: VariantReference[] = [];

      for (const variantReferenceId of updateRefProductDto.variantReferences) {
        const variantReference: VariantReference = await this.variantReferenceRepository.findOne({
          where: {
            id: variantReferenceId,
          },
        });

        if (!variantReference)
          throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

        variantReferences.push(variantReference);
      }

      updatedRefProduct.variantReferences = variantReferences;
    }

    if (updateRefProductDto.colors) {
      const colors: Color[] = [];

      for (const colorId of updateRefProductDto.colors) {
        const color: Color = await this.colorRepository.findOne({
          where: {
            id: colorId,
          },
        });

        if (!color)
          throw new NotFoundException(`Color with id ${colorId} not found`);

        // if (!color.isActive)
        //   throw new BadRequestException(`Color with id ${colorId} is currently inactive`);

        colors.push(color);
      }

      updatedRefProduct.colors = colors;
    };

    if (updateRefProductDto.markingServiceProperty) {
      const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
        where: {
          id: updateRefProductDto.markingServiceProperty,
        },
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Variant reference with id ${updateRefProductDto.markingServiceProperty} not found`);

      updatedRefProduct.markingServiceProperty = markingServiceProperty;
    }

    if (updateRefProductDto.deliveryTimes) {
      const deliveryTimes: DeliveryTime[] = [];

      for (const deliveryTimeId of updateRefProductDto.deliveryTimes) {
        const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
          where: {
            id: deliveryTimeId,
          },
        });

        if (!deliveryTime)
          throw new NotFoundException(`Delivery time with id ${deliveryTimeId} not found`);

        deliveryTimes.push(deliveryTime);
      }

      updatedRefProduct.deliveryTimes = deliveryTimes;
    }

    Object.assign(refProduct, updatedRefProduct);

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async desactivate(id: string) {
    const refProduct: RefProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
    });

    refProduct.isActive = !refProduct.isActive;

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async changeIsAllowedStatus(id: string) {
    const refProduct: RefProduct = await this.refProductRepository.findOneBy({ id });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    refProduct.isAllowed == 0 ? refProduct.isAllowed = 1 : refProduct.isAllowed = 0;

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async remove(id: string) {
    const refProduct: RefProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
    });

    await this.refProductRepository.remove(refProduct);

    return {
      refProduct
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
