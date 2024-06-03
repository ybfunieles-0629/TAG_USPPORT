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
import { FinancingCostProfit } from 'src/financing-cost-profits/entities/financing-cost-profit.entity';



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


    @InjectRepository(FinancingCostProfit)
    private readonly systemFinancingCostProfit: Repository<FinancingCostProfit>,

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

  async calculations(results: RefProduct[], margin: number, clientId: string, tipo = false, feeMarca = 0) {

    console.log(clientId)

    let staticQuantities: number[];
    if (tipo) {
      staticQuantities = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
        150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000,
        7000, 8000, 9000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
        100000, 200000,
      ];
      // staticQuantities = [
      //   1, 2,
      // ];
    } else {
      staticQuantities = [1];
    }

    const clientSended: Client = await this.clientRepository.findOne({
      where: {
        id: clientId,
      },
      relations: [
        'user',
        'user.company',
      ],
    });

    console.log()
    console.log(clientSended)

    const clientUser: User = clientSended?.user;

    console.log(clientUser)

    let clientType: string = '';

    // SE DEBE VERIFICAR SI EL USUARIO ES COORPORATIVO O QUÉ
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
            valueSinIva: 0,
            valueConIva: 0,
            value: 0,
            valueIva: 0,
            totalCostoProduccionSinIva: 0,
            totalCostoProduccion: 0,
            totalValue: 0,
            transportPrice: 0,
          };

          console.log("inicio");

          let cantidadProductoinicial = staticQuantities[i];


          console.log()


          let value: number = changingValue;
          console.log(value)

          //* SI EL PRODUCTO NO TIENE UN PRECIO NETO
          if (product.hasNetPrice == 0) {
            //* SI EL PRODUCTO TIENE UN PRECIO PROVEEDOR ASOCIADO
            if (product.supplierPrices.length > 0) {
              const supplierPrice: SupplierPrice = product.supplierPrices[0];

              //* RECORRO LA LISTA DE PRECIOS DEL PRECIO DEL PROVEEDOR
              supplierPrice.listPrices.forEach((listPrice: ListPrice) => {
                if (listPrice.minimun >= i && listPrice.nextMinValue == 1 && listPrice.maximum <= i || listPrice.minimun >= i && listPrice.nextMinValue == 0) {
                  //* SI APLICA PARA TABLA DE PRECIOS DE PROVEEDOR
                  value += listPrice.price;
                  console.log(value)

                  return;
                };
              });
              console.log()
            } else {

              //* AGREGAR DESCUENTO DE ENTRADA
              const entryDiscount: number = product.entryDiscount || 0;
              const entryDiscountValue: number = (entryDiscount / 100) * value || 0;
              value -= entryDiscountValue;
              console.log(value)

              //* BUSCO DESCUENTO PROMO
              const promoDiscount: number = product.promoDisccount || 0;
              const promoDiscountPercentage: number = (promoDiscount / 100) * value || 0;
              console.log(promoDiscount)

              value -= promoDiscountPercentage;
              console.log(value)



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
                        console.log(value)

                        return;
                      };

                      discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                        if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                          const discount: number = (listDiscount.disccountValue / 100) * value;
                          value -= discount;
                          console.log(value)

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
                          console.log(value)

                          return;
                        };

                        discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                          if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                            const discount: number = (listDiscount.disccountValue / 100) * value;
                            value -= discount;
                            console.log(value)

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


          //******************************************************************************************************** */
          //******************************************************************************************************** */

          // COSTO BRUTO DE PRODUCTO === VARIABLE GLOBAL
          const CostoBrutoProducto = value;
          console.log(CostoBrutoProducto)


          let IvaPrimera = 0;
          // //* APLICAR IVA   **************************************************************
          if (product.iva > 0 || product.iva != undefined) {
            IvaPrimera = (product.iva / 100) * value;
            value += IvaPrimera;
            console.log(value)
          };

          if (product.iva == 0) {
            IvaPrimera = (19 / 100) * value;
            value += IvaPrimera;
            console.log(value)
          }

          //TOTAL COSTO UNITARIO DEL PRODUCTO === VARIABLE GLOBAL
          let CostoTotalUnitario = value;
          CostoTotalUnitario = Math.round(CostoTotalUnitario);

          console.log(CostoTotalUnitario);


          let Imprevistos = 0;
          // //* VERIFICAR SI TIENE FEE DE IMPREVISTOS ************************************* CostoBrutoProducto
          if (product.unforeseenFee > 0) {
            const unforeseenFee: number = (product.unforeseenFee / 100) * CostoBrutoProducto;
            Imprevistos = unforeseenFee;
            console.log(Imprevistos)
          } else {
            const unforeseenFee: number = systemConfig.unforeseenFee;
            const unforeseenFeePercentage: number = (unforeseenFee / 100) * CostoBrutoProducto;
            Imprevistos = unforeseenFeePercentage;
            console.log(Imprevistos)
          }



          // SUBTOTAL === VARIABLE GLOBAL

          console.log(CostoBrutoProducto)
          console.log(Imprevistos)
          console.log(cantidadProductoinicial)

          let Subtotal = cantidadProductoinicial * (CostoBrutoProducto + Imprevistos);
          Subtotal = Math.round(Subtotal);
          console.log(Subtotal)


          let IvaSegunda = 0;
          // //* APLICAR IVA   **************************************************************
          if (product.iva > 0 || product.iva != undefined) {
            IvaSegunda = (product.iva / 100) * Subtotal;
            console.log(IvaSegunda)
          };
          if (product.iva == 0) {
            IvaSegunda = (19 / 100) * Subtotal;
            console.log(IvaSegunda)
          }



          // TRASPORTE CALCULO DE CAJAS ***************************************************
          // CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
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


          // CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
          const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
            ? localTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalPackingVolume);
              const diffB = Math.abs(b.volume - totalPackingVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };
          console.log(transportPrice)

          // prices.transportPrice = transportPrice;



          //TOTAL DESEMBOLSO COMPRA DE PRODUCTO === VARIABLE GLOBAL
          let TotalDesembolsoCompraProducto = Subtotal + IvaSegunda
          TotalDesembolsoCompraProducto = Math.round(TotalDesembolsoCompraProducto);
          console.log(TotalDesembolsoCompraProducto)



          // DIAS DE ENTREGA O PRODUCCIÓN 
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


          // % ADELANTO EN PRODUCCIÓN 
          const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
          const advancePercentageValue: number = (advancePercentage / 100) * value;
          console.log(advancePercentage)


          // FINANCIACIÓN ===>>> ES EL DEL PROVEEDOR 
          const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage) || 0;
          console.log(supplierFinancingPercentage)

          console.log(deliveryTimeToSave)


          //GASTOS FINANCIEROS PRE-ENTREGA === VARIABLE GLOBAL 
          let dataadvancePercentage = advancePercentage / 100;
          let datasupplierFinancingPercentage = supplierFinancingPercentage / 100;

          let GastoFinancieroPreentrega = (TotalDesembolsoCompraProducto * dataadvancePercentage) * ((datasupplierFinancingPercentage / 30) * deliveryTimeToSave)
          GastoFinancieroPreentrega = Math.round(GastoFinancieroPreentrega);

          console.log(GastoFinancieroPreentrega)



          // TOTAL DESEMBOLSO === VARIABLE GLOBAL

          const TotalDesembolso = TotalDesembolsoCompraProducto + GastoFinancieroPreentrega;
          console.log(TotalDesembolso)



          //* CALCULAR EL IMPUESTO 4 X 1000
          const fourPercentage = (TotalDesembolso * 0.004);
          let CuatroForMil = fourPercentage;
          CuatroForMil = Math.round(CuatroForMil);

          console.log(CuatroForMil)



          //SUBTOTAL ANTES DE IVA (TABLA QUEMADA COSTO) === VARIABLE GLOBAL 
          let SubTotalAntesDeIva = Subtotal + GastoFinancieroPreentrega + CuatroForMil;
          SubTotalAntesDeIva = Math.round(SubTotalAntesDeIva);
          console.log(SubTotalAntesDeIva)


          // TOTAL COSTO DE PRODUCTO === VARIABLE GLOBAL
          let TotalCostoDelProducto = SubTotalAntesDeIva + IvaSegunda;
          TotalCostoDelProducto = Math.round(TotalCostoDelProducto);
          console.log(TotalCostoDelProducto)



          // MARGEN DE LA CATEGORIA
          const mainCategory: CategoryTag = await this.categoryTagRepository.findOne({
            where: {
              id: product?.refProduct?.tagCategory,
            },
          });


          //* MARGEN DE GANANCIA DEL PROVEEDOR
          const profitMargin: number = product?.refProduct?.supplier?.profitMargin || 0;

          console.log(mainCategory)
          console.log(profitMargin)

          // PRECIO DE VENTA SIN IVA (TABLA QUEMADA) === VARIABLE GLOBAL 
          let PrecioVentaSinIva = 0;
          if (mainCategory) {
            const sumaProcentajes = (1 + (+mainCategory.categoryMargin + profitMargin) / 100)
            PrecioVentaSinIva = (SubTotalAntesDeIva * sumaProcentajes);

            //* REDONDEANDO DECIMALES
            PrecioVentaSinIva = Math.round(PrecioVentaSinIva);
            console.log(PrecioVentaSinIva)
          };



          // https://e-bulky.net/api/ref-products/0d27f5fb-f4b1-40db-859c-46d607079bf5?margin=10
          // https://e-bulky.net/api/ref-products/filter?limit=5&offset=0&margin=10



          let parsedMargin: number = 0;
          let MargenFinanciacion: number = 0;





          // nuevo Yeison
          let financeCostProfist: any = await this.systemFinancingCostProfit.find();
          console.log(financeCostProfist)


          //* MARGEN POR FINANCIACIÓN 
          // const MargenPorFinanciacion: number = 0;

          let paymentDays: any[] = [];
          for (const paymentDate of financeCostProfist) {
            let data = {
              day: paymentDate.days,
              percentage: paymentDate.financingPercentage / 100,
            }

            paymentDays.push(data)
          }

          console.log(paymentDays)
          parsedMargin = +margin;
          if (parsedMargin < 1 && !clientSended) {
            parsedMargin = systemConfig.noCorporativeClientsMargin;
          }
          console.log(parsedMargin)
          console.log()

          // //* ADICIONAR EL MARGEN DE GANANCIA DEL CLIENTE
          if (clientSended) {


            //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
            const profitMargin: number = 0;

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

              MargenFinanciacion = percentageDiscount;
              console.log(MargenFinanciacion)
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

              MargenFinanciacion = percentageDiscount;
              console.log(MargenFinanciacion)

            };


            //* SI EL CLIENTE ES PRINCIPAL
            if (clientType != 'cliente corporativo principal' && clientType != 'cliente corporativo secundario') {
              // MargenFinanciacion = 0;

              // Días de pago de Cliente NO Corporativo
              const day60 = paymentDays.find(item => item.day === 1);
              console.log(day60)
              // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
              MargenFinanciacion = day60 ? day60.percentage : 0;
            };

            console.log(MargenFinanciacion)

          } else {
            // Días de pago de Cliente NO Corporativo
            const day60 = paymentDays.find(item => item.day === 1);
            console.log(day60)
            // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
            MargenFinanciacion = day60 ? day60.percentage : 0;
          };


          console.log(MargenFinanciacion);



          // TOTAL CUADRO DERECHO

          let dataMargin = parsedMargin / 100;
          console.log(parsedMargin)
          let dataFinanciacion = MargenFinanciacion;

          const F5 = PrecioVentaSinIva;
          const F6 = dataMargin;
          const F7 = dataFinanciacion;

          const TotalCuadroDerecho = F5 * (1 + F6 + F7);
          console.log(TotalCuadroDerecho);


          console.log()

          // FEE DE LA MARCA DE USUARIO AL INICIAR SEIÓN > ESTO SE APLICA EN EL CARRITO

          // ======== CALCULO FEE ITERATIVO MARCACION

          let F8 = feeMarca / 100;

          let primerCalculoMarcacion = F5 * (1 + F6 + F7) * F8;
          let segundoCalculoMarcacion = primerCalculoMarcacion * F8;
          let tercerCalculoMarcacion = segundoCalculoMarcacion * F8;
          let cuartoCalculoMarcacion = tercerCalculoMarcacion * F8;

          let resultadoMarcacion = primerCalculoMarcacion + segundoCalculoMarcacion + tercerCalculoMarcacion + cuartoCalculoMarcacion;
          let FeeMarcacionTotalCalculado = resultadoMarcacion;
          FeeMarcacionTotalCalculado = Math.round(FeeMarcacionTotalCalculado);
          console.log(FeeMarcacionTotalCalculado)
          // ======== FIN CALCULO FEE ITERATIVO MARCACION


          // SUBTOTAL PRECIO DE VENTA (A MOSTRAR) === VARIABLE GLOBAL
          let DATApARSE = parsedMargin /100;
          const sumaFee = (1 + (DATApARSE + MargenFinanciacion)) ;
          let SubtotalPrecioVenta = (PrecioVentaSinIva * sumaFee) + FeeMarcacionTotalCalculado;
          SubtotalPrecioVenta = Math.round(SubtotalPrecioVenta);



          // IVA 
          const ivaProd: number = product.iva;
          let IvaTercera: number;
          if (ivaProd > 0) {
            IvaTercera = (product.iva / 100) * SubtotalPrecioVenta;
          } else {
            IvaTercera = (19 / 100) * SubtotalPrecioVenta;
          }
          IvaTercera = Math.round(IvaTercera);
          console.log(IvaTercera)



          //PRECIO DE VENTA TOTAL (A MOSTRAR)
          let PrecioVentaTotal = SubtotalPrecioVenta + IvaTercera;
          PrecioVentaTotal = Math.round(PrecioVentaTotal);
          console.log(PrecioVentaTotal)



          // VALORES UNITARIOS
          const cantidadUnitaria = staticQuantities[0];
          let SubtotalPrecioVentaUnitario = SubtotalPrecioVenta / cantidadUnitaria;
          const IvaTerceraUnitaria = IvaTercera / cantidadUnitaria;
          const PrecioVentaTotalUnitaria = PrecioVentaTotal / cantidadUnitaria;

          console.log(SubtotalPrecioVentaUnitario)
          console.log(IvaTerceraUnitaria)
          console.log(PrecioVentaTotalUnitaria)

          //******************************************************************************************************** */
          //******************************************************************************************************** */
          //******************************************************************************************************** */


          prices.totalCostoProduccionSinIva = SubTotalAntesDeIva,
          prices.totalCostoProduccion = TotalCostoDelProducto; // yeison
          prices.valueSinIva = SubtotalPrecioVenta;
          prices.valueConIva = PrecioVentaTotal;
          prices.totalValue = SubtotalPrecioVenta;
          prices.value = SubtotalPrecioVentaUnitario; 
          prices.valueIva = PrecioVentaTotalUnitaria; 

          burnPriceTable.push(prices);

          console.log(prices.totalCostoProduccionSinIva)
          console.log(prices.totalCostoProduccion)




          // burnPriceTable.push(prices);

          // const percentageDiscount: number = 0.01;

          // let valuDe;
          // valuDe = SubtotalPrecioVentaUnitario * (1 - percentageDiscount);

          // value = Math.round(valuDe);

          // SubtotalPrecioVentaUnitario = valuDe;
          // console.log(changingValue)


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

  async findAll(paginationDto: PaginationDto) {
    const totalCount = await this.refProductRepository.count();

    const { limit = totalCount, offset = 0, calculations = 0, supplier = 0, dashboard = 1, margin = 0, clientId = '', feeMarca=0 } = paginationDto;

    let user;

    const userFound = await this.userRepository.findOne({
      where: {
        client: {
          id: clientId,
        },
      },
      relations: [
        'company',
        'supplier',
        'client',
        'admin',
        'admin.clients',
        'admin.clients.user',
        'roles',
        'permissions',
        'privileges',
      ]
    });

    user = userFound;

    if (!user) {
      user = {
        roles: [
          {
            name: '',
          }]
        ,
      };
    };

    let results: RefProduct[] = [];

    if (user?.roles?.some((role: Role) => role.name.toLowerCase().trim() == 'proveedor')) {
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
    };

    const finalResults: RefProduct[] = results;
    let finalCalculatedResults = [];
    let finalFinalResults = [];

    if (calculations == 1) {
      const calculatedResults = results.length > 0 ? await this.calculations(results, margin, clientId, false, feeMarca) : [];
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








  async findAllList(paginationDto: PaginationDto) {
    const totalCount = await this.refProductRepository.count();

    const { limit = totalCount, offset = 0, calculations = 0, supplier = 0, dashboard = 0, margin = 0, clientId = '', feeMarca=0 } = paginationDto;

    let user;

    const userFound = await this.userRepository.findOne({
      where: {
        client: {
          id: clientId,
        },
      },
      relations: [
        'company',
        'supplier',
        'client',
        'admin',
        'admin.clients',
        'admin.clients.user',
        'roles',
        'permissions',
        'privileges',
      ]
    });

    user = userFound;

    if (!user) {
      user = {
        roles: [
          {
            name: '',
          }]
        ,
      };
    };

    let results: RefProduct[] = [];

    if (user?.roles?.some((role: Role) => role.name.toLowerCase().trim() == 'proveedor')) {
      if (dashboard == 1) {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .leftJoinAndSelect('rp.supplier', 'rpSupplier')
          .where('rpSupplier.id =:userId', { userId: user.id })
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .take(limit)
          .skip(offset)
          .getMany();
      } else {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .leftJoinAndSelect('rp.supplier', 'supplier')
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .leftJoinAndSelect('supplier.user', 'supplierUser')
          .take(limit)
          .skip(offset)
          .getMany();
      }
    } else {
      if (dashboard == 1) {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .leftJoinAndSelect('rp.supplier', 'rpSupplier')
          .where('rpSupplier.id =:userId', { userId: user.id })
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .take(limit)
          .skip(offset)
          .getMany();
      } else {
        results = await this.refProductRepository
          .createQueryBuilder('rp')
          .leftJoinAndSelect('rp.supplier', 'supplier')
          .leftJoinAndSelect('rp.categorySuppliers', 'rpCategorySuppliers')
          .leftJoinAndSelect('rp.categoryTags', 'rpCategoryTags')
          .leftJoinAndSelect('supplier.user', 'supplierUser')
          .take(limit)
          .skip(offset)
          .getMany();
      };
    };

    const finalResults: RefProduct[] = results;
    let finalCalculatedResults = [];
    let finalFinalResults = [];

    if (finalResults.length > 0) {
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

  async filterProductsWithDiscount(paginationDto: PaginationDto, margin, clientId: string, feeMarca:number) {
    const { limit = 4, offset = 0 } = paginationDto;

    console.log(paginationDto)

    console.log(margin)
    console.log(clientId)

    console.log(feeMarca)

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
      .andWhere('product.promoDisccount > 0')
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

    const finalResults = results.length > 0 ? await this.calculations(results, margin, clientId, false, feeMarca) : [];

    return {
      totalCount: finalResults.length,
      results: finalResults
    };
  };


  async findOne(id: string, margin: number, clientId: string, feeMarca:number) {
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

    const finalResults = refProducts.length > 0 ? await this.calculations(refProducts, margin, clientId, false, feeMarca) : [];

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
    const { limit = 1, offset = 0, margin, clientId, feeMarca = 0 } = paginationDto;

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

        console.log(categoryTagId)
        console.log(categoryTag)

        if (!categoryTag) {
          throw new NotFoundException(`Category tag with id ${categoryTagId} not found`);
        }

        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.tagCategory = :categoryTagId', { categoryTagId })
          .andWhere('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.colors', 'refProductColors')
          .leftJoinAndSelect('refProduct.categoryTags', 'categoryTags')
          .orWhere('(categoryTags.id = :categoryTagId)', { categoryTagId: categoryTagId })
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.products', 'products')
          // .andWhere('products.weight > :weight', { weight: 0 })
          // .andWhere('products.height > :height', { height: 0 })
          // .andWhere('products.width > :width', { width: 0 })
          // .andWhere('products.large > :large', { large: 0 })
          .leftJoinAndSelect('products.colors', 'colors')
          .leftJoinAndSelect('products.supplierPrices', 'supplierPrices')
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          // .take(limit)
            // .skip(offset)
            .getMany();

            console.log(refProducts)


        refProductsToShow.push(...refProducts);
        console.log(refProductsToShow)

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

          console.log(filteredRefProducts)
        refProductsToShow = filteredRefProducts;
        console.log("aqui entro 1")
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .where('product.referencePrice BETWEEN :minPrice AND :maxPrice', {
            minPrice,
            maxPrice,
          })
          .take(limit)
            .skip(offset)
            .getMany();

        console.log("aqui entro 2")
        console.log(refProducts)

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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          .take(limit)
          .skip(offset)
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
                (product) => product.availableUnit >= inventory
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          .select(['refProduct.id', 'product.availableUnit AS totalAvailableUnit'])
          .groupBy('refProduct.id')
          .having('totalAvailableUnit >= :inventory', { inventory })
          .take(limit)
            .skip(offset)
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          .take(limit)
            .skip(offset)
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          .take(limit)
            .skip(offset)
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
            .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
            .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
            .leftJoinAndSelect('product.packings', 'productPackings')
            .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
            .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
            .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
            .orderBy('product.createdAt', 'DESC')
            .take(limit)
            .skip(offset)
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
            .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
            .take(limit)
            .skip(offset)
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .take(limit)
            .skip(offset)
            .getMany();


        refProductsToShow.push(...refProducts);
      };
    };

    if (filterRefProductsDto.keywords) {
      const searchKeywords: string = filterRefProductsDto.keywords.toLowerCase();
      console.log(searchKeywords)
      const keywordsArray: string[] = searchKeywords.split(' ');

      if (refProductsToShow.length > 0) {
        refProductsToShow = refProductsToShow.filter((refProduct) => {
          const productKeywords: string = (refProduct.keywords || '').toLowerCase();
          const productName: string = (refProduct.name || '').toLowerCase();
          const productCodeApiName: string = (refProduct.referenceCode || '').toLowerCase();
          const productDescription: string = (refProduct.description || '').toLowerCase();
          const productShortDescription: string = (refProduct.shortDescription || '').toLowerCase();

          return keywordsArray.some(keyword =>
            productKeywords.includes(keyword) ||
            productName.includes(keyword) ||
            productCodeApiName.includes(keyword) ||
            productDescription.includes(keyword) ||
            productShortDescription.includes(keyword)
          );
        });
      } else {

        console.log(filterRefProductsDto)
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .where('refProduct.weight > :weight', { weight: 0 })
          .andWhere('refProduct.height > :height', { height: 0 })
          .andWhere('refProduct.width > :width', { width: 0 })
          .andWhere('refProduct.large > :large', { large: 0 })
          .andWhere('refProduct.referenceCode > :referenceCode', { filterRefProductsDto })
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
          .leftJoinAndSelect('supplierPrices.listPrices', 'listPrices')
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
          .take(limit)
            .skip(offset)
            .getMany();


        refProductsToShow.push(...refProducts);
      }
    }

    refProductsToShow = refProductsToShow.filter((refProduct) => refProduct.products.length > 0);

    const calculatedResults = refProductsToShow?.length > 0 ? await this.calculations(refProductsToShow, margin, clientId, false, feeMarca) : [];

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

    console.log(id)
    console.log(refProduct)


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



































  async findOneOne(id: string, margin: number, clientId: string, cantidadEnviada: number, feeMarca:number) {
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

    const finalResults = refProducts.length > 0 ? await this.calculationsOne(refProducts, margin, clientId, cantidadEnviada, feeMarca) : [];

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









  // Metodo para buscar una cantidad diferente
  async calculationsOne(results: RefProduct[], margin: number, clientId: string, cantidadEnviada = 0, feeMarca:number = 0) {

    let staticQuantities: number[] = [cantidadEnviada];

    console.log(clientId)

    const clientSended: Client = await this.clientRepository.findOne({
      where: {
        id: clientId,
      },
      relations: [
        'user',
        'user.company',
      ],
    });

    console.log(clientSended)

    const clientUser: User = clientSended?.user;
    console.log(clientUser)

    let clientType: string = '';

    // SE DEBE VERIFICAR SI EL USUARIO ES COORPORATIVO O QUÉ
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

    console.log()

    console.log(clientType)


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
            value: 0,
            valueIva:0,
            valueSinIva: 0,
            valueConIva: 0,
            totalCostoProduccionSinIva: 0,
            totalCostoProduccion: 0,
            totalValue: 0,
            transportPrice: 0,
          };

          console.log("inicio");

          const cantidadProductoinicial = staticQuantities[i];
          console.log(cantidadProductoinicial)

          let value: number = changingValue;
          console.log(value)

          //* SI EL PRODUCTO NO TIENE UN PRECIO NETO
          if (product.hasNetPrice == 0) {
            //* SI EL PRODUCTO TIENE UN PRECIO PROVEEDOR ASOCIADO
            if (product.supplierPrices.length > 0) {
              const supplierPrice: SupplierPrice = product.supplierPrices[0];

              //* RECORRO LA LISTA DE PRECIOS DEL PRECIO DEL PROVEEDOR
              supplierPrice.listPrices.forEach((listPrice: ListPrice) => {
                if (listPrice.minimun >= i && listPrice.nextMinValue == 1 && listPrice.maximum <= i || listPrice.minimun >= i && listPrice.nextMinValue == 0) {
                  //* SI APLICA PARA TABLA DE PRECIOS DE PROVEEDOR
                  value += listPrice.price;
                  console.log(value)

                  return;
                };
              });
            } else {

              //* SI LO ENCUENTRA LO AÑADE, SINO LE PONE UN 0 Y NO AÑADE NADA
              const entryDiscount: number = product.entryDiscount || 0;
              const entryDiscountValue: number = (entryDiscount / 100) * value || 0;
              value -= entryDiscountValue;
              console.log(value)

              //* BUSCO DESCUENTO PROMO
              const promoDiscount: number = product.promoDisccount || 0;
              const promoDiscountPercentage: number = (promoDiscount / 100) * value || 0;
              console.log(promoDiscount)

              value -= promoDiscountPercentage;
              console.log(value)



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
                        console.log(value)

                        return;
                      };

                      discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                        if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                          const discount: number = (listDiscount.disccountValue / 100) * value;
                          value -= discount;
                          console.log(value)

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
                          console.log(value)

                          return;
                        };

                        discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                          if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                            const discount: number = (listDiscount.disccountValue / 100) * value;
                            value -= discount;
                            console.log(value)

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


          //******************************************************************************************************** */
          //******************************************************************************************************** */

          // COSTO BRUTO DE PRODUCTO === VARIABLE GLOBAL
          const CostoBrutoProducto = value;
          console.log(CostoBrutoProducto)


          let IvaPrimera = 0;
          // //* APLICAR IVA   **************************************************************
          if (product.iva > 0 || product.iva != undefined) {
            IvaPrimera = (product.iva / 100) * value;
            value += IvaPrimera;
            console.log(value)
          };

          if (product.iva == 0) {
            IvaPrimera = (19 / 100) * value;
            value += IvaPrimera;
            console.log(value)
          }

          //TOTAL COSTO UNITARIO DEL PRODUCTO === VARIABLE GLOBAL
          let CostoTotalUnitario = value;
          CostoTotalUnitario = Math.round(CostoTotalUnitario);

          console.log(CostoTotalUnitario);

          let Imprevistos = 0;
          // //* VERIFICAR SI TIENE FEE DE IMPREVISTOS ************************************* CostoBrutoProducto
          if (product.unforeseenFee > 0) {
            const unforeseenFee: number = (product.unforeseenFee / 100) * CostoBrutoProducto;
            Imprevistos = unforeseenFee;
            console.log(Imprevistos)
          } else {
            const unforeseenFee: number = systemConfig.unforeseenFee;
            const unforeseenFeePercentage: number = (unforeseenFee / 100) * CostoBrutoProducto;
            Imprevistos = unforeseenFeePercentage;
            console.log(Imprevistos)
          }



          // SUBTOTAL === VARIABLE GLOBAL
          let Subtotal = cantidadProductoinicial * (CostoBrutoProducto + Imprevistos);
          Subtotal = Math.round(Subtotal);
          console.log(Subtotal)


          let IvaSegunda = 0;
          // //* APLICAR IVA   **************************************************************
          if (product.iva > 0 || product.iva != undefined) {
            IvaSegunda = (product.iva / 100) * Subtotal;
            console.log(value)
          };
          if (product.iva == 0) {
            IvaSegunda = (19 / 100) * Subtotal;
            console.log(IvaSegunda)
          }



          // TRASPORTE CALCULO DE CAJAS ***************************************************
          // CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
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


          // CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
          const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
            ? localTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalPackingVolume);
              const diffB = Math.abs(b.volume - totalPackingVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };
          console.log(transportPrice)

          // prices.transportPrice = transportPrice;



          //TOTAL DESEMBOLSO COMPRA DE PRODUCTO === VARIABLE GLOBAL
          let TotalDesembolsoCompraProducto = Subtotal + IvaSegunda;
          TotalDesembolsoCompraProducto = Math.round(TotalDesembolsoCompraProducto);
          console.log(TotalDesembolsoCompraProducto)



          // DIAS DE ENTREGA O PRODUCCIÓN 
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


          console.log(deliveryTimeToSave)
          // % ADELANTO EN PRODUCCIÓN 
          const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
          const advancePercentageValue: number = (advancePercentage / 100) * value;
          console.log(advancePercentage)


          // FINANCIACIÓN 
          const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage) || 0;
          console.log(supplierFinancingPercentage)

          console.log(deliveryTimeToSave)
          //GASTOS FINANCIEROS PRE-ENTREGA === VARIABLE GLOBAL 

          let dataadvancePercentage = advancePercentage / 100;
          let datasupplierFinancingPercentage = supplierFinancingPercentage / 100;

          let GastoFinancieroPreentrega = (TotalDesembolsoCompraProducto * dataadvancePercentage) * ((datasupplierFinancingPercentage / 30) * deliveryTimeToSave)
          GastoFinancieroPreentrega = Math.round(GastoFinancieroPreentrega);

          console.log(GastoFinancieroPreentrega)

          // const GastoFinancieroPreentrega = (TotalDesembolsoCompraProducto * advancePercentage) * ((supplierFinancingPercentage / 30) * deliveryTimeToSave)
          // console.log(GastoFinancieroPreentrega)



          // TOTAL DESEMBOLSO === VARIABLE GLOBAL

          const TotalDesembolso = TotalDesembolsoCompraProducto + GastoFinancieroPreentrega;
          console.log(TotalDesembolso)



          //* CALCULAR EL IMPUESTO 4 X 1000
          const fourPercentage = (TotalDesembolso * 0.004);
          let CuatroForMil = fourPercentage;
          CuatroForMil = Math.round(CuatroForMil);

          console.log(CuatroForMil)



          //SUBTOTAL ANTES DE IVA (TABLA QUEMADA COSTO) === VARIABLE GLOBAL 
          console.log(Subtotal)
          console.log(GastoFinancieroPreentrega)
          console.log(CuatroForMil)
          let SubTotalAntesDeIva = Subtotal + GastoFinancieroPreentrega + CuatroForMil;
          SubTotalAntesDeIva = Math.round(SubTotalAntesDeIva);
          console.log(SubTotalAntesDeIva)


          // TOTAL COSTO DE PRODUCTO === VARIABLE GLOBAL
          let TotalCostoDelProducto = SubTotalAntesDeIva + IvaSegunda;
          TotalCostoDelProducto = Math.round(TotalCostoDelProducto);
          console.log(TotalCostoDelProducto)



          // MARGEN DE LA CATEGORIA
          const mainCategory: CategoryTag = await this.categoryTagRepository.findOne({
            where: {
              id: product?.refProduct?.tagCategory,
            },
          });


          //* MARGEN DE GANANCIA DEL PROVEEDOR
          const profitMargin: number = product?.refProduct?.supplier?.profitMargin || 0;

          console.log(profitMargin)
          console.log(mainCategory)

          // PRECIO DE VENTA SIN IVA (TABLA QUEMADA) === VARIABLE GLOBAL 
          let PrecioVentaSinIva = 0;
          if (mainCategory) {
            const sumaProcentajes = (1 + (+mainCategory.categoryMargin + profitMargin) / 100)
            PrecioVentaSinIva = (SubTotalAntesDeIva * sumaProcentajes);

            //* REDONDEANDO DECIMALES
            PrecioVentaSinIva = Math.round(PrecioVentaSinIva);
            console.log(PrecioVentaSinIva)
          };



          // https://e-bulky.net/api/ref-products/0d27f5fb-f4b1-40db-859c-46d607079bf5?margin=10
          // https://e-bulky.net/api/ref-products/filter?limit=5&offset=0&margin=10



          let parsedMargin: number = 0;
          let MargenFinanciacion: number = 0;


          let financeCostProfist: any = await this.systemFinancingCostProfit.find();
          console.log(financeCostProfist)

          let paymentDays: any[] = [];
          for (const paymentDate of financeCostProfist) {
            let data = {
              day: paymentDate.days,
              percentage: paymentDate.financingPercentage / 100,
            }

            paymentDays.push(data)
          }


          console.log(paymentDays)




          parsedMargin = +margin;
          if (parsedMargin < 1 && !clientSended) {
            parsedMargin = systemConfig.noCorporativeClientsMargin;
          }
          console.log(parsedMargin)
          console.log()


          // //* ADICIONAR EL MARGEN DE GANANCIA DEL CLIENTE
          if (clientSended) {

            //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
            const profitMargin: number = 0;

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

              MargenFinanciacion = percentageDiscount;
              console.log(MargenFinanciacion)
            };

            //* SI EL CLIENTE ES PRINCIPAL
            if (clientType == 'cliente corporativo principal') {
              const margin: number = clientSended.margin || 0;
              const paymentTerms: number = clientSended.paymentTerms || 0;

              console.log(paymentTerms)
              let percentageDiscount: number = 0;

              paymentDays.forEach(paymentDay => {
                console.log(paymentDay.day)
                if (paymentDay.day == paymentTerms) {
                  percentageDiscount = paymentDay.percentage;
                  console.log(percentageDiscount)
                };
              });


              console.log(percentageDiscount)

              MargenFinanciacion = percentageDiscount;
              console.log(MargenFinanciacion)

            };


            //* SI EL CLIENTE ES PRINCIPAL
            if (clientType !== 'cliente corporativo principal' && clientType !== 'cliente corporativo secundario') {
              const day60 = paymentDays.find(item => item.day === 1);
              console.log(day60)

              MargenFinanciacion = day60 ? day60.percentage : 0;
            };

            console.log(MargenFinanciacion)

          } else {
            // Días de pago de Cliente NO Corporativo
            const day60 = paymentDays.find(item => item.day === 1);
            console.log(day60)
            // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
            MargenFinanciacion = day60 ? day60.percentage : 0;
          };






          // TOTAL CUADRO DERECHO


          let dataMargin = parsedMargin / 100;
          console.log(parsedMargin)
          let dataFinanciacion = MargenFinanciacion;

          const F5 = PrecioVentaSinIva;
          const F6 = dataMargin;
          const F7 = dataFinanciacion;

          console.log(F5)
          console.log(F6)
          console.log(F7)

          let TotalCuadroDerecho = F5 * (1 + F6 + F7);
          TotalCuadroDerecho = Math.round(TotalCuadroDerecho);

          console.log(TotalCuadroDerecho);


          console.log(MargenFinanciacion)

          // FEE DE LA MARCA DE USUARIO AL INICIAR SEIÓN > ESTO SE APLICA EN EL CARRITO

          // ======== CALCULO FEE ITERATIVO MARCACION

          let F8 = feeMarca / 100;

          console.log(feeMarca)

          let primerCalculoMarcacion = F5 * (1 + F6 + F7) * F8;
          let segundoCalculoMarcacion = primerCalculoMarcacion * F8;
          let tercerCalculoMarcacion = segundoCalculoMarcacion * F8;
          let cuartoCalculoMarcacion = tercerCalculoMarcacion * F8;

          let resultadoMarcacion = primerCalculoMarcacion + segundoCalculoMarcacion + tercerCalculoMarcacion + cuartoCalculoMarcacion;
          let FeeMarcacionTotalCalculado = resultadoMarcacion;
          FeeMarcacionTotalCalculado = Math.round(FeeMarcacionTotalCalculado);
          console.log(FeeMarcacionTotalCalculado)
          // ======== FIN CALCULO FEE ITERATIVO MARCACION


          // SUBTOTAL PRECIO DE VENTA (A MOSTRAR) === VARIABLE GLOBAL
          let DATApARSE = parsedMargin /100;
          const sumaFee = (1 + (DATApARSE + MargenFinanciacion)) ;
          let SubtotalPrecioVenta = (PrecioVentaSinIva * sumaFee) + FeeMarcacionTotalCalculado;
          SubtotalPrecioVenta = Math.round(SubtotalPrecioVenta);


          console.log(SubtotalPrecioVenta)


          // IVA 
          const ivaProd: number = product.iva;
          let IvaTercera: number;
          if (ivaProd > 0) {
            IvaTercera = (product.iva / 100) * SubtotalPrecioVenta;
          } else {
            IvaTercera = (19 / 100) * SubtotalPrecioVenta;
          }
          IvaTercera = Math.round(IvaTercera);
          console.log(IvaTercera)



          //PRECIO DE VENTA TOTAL (A MOSTRAR)
          let PrecioVentaTotal = SubtotalPrecioVenta + IvaTercera;
          PrecioVentaTotal = Math.round(PrecioVentaTotal);
          console.log(PrecioVentaTotal)



          // VALORES UNITARIOS
          const cantidadUnitaria = staticQuantities[0];
          const SubtotalPrecioVentaUnitario = SubtotalPrecioVenta / cantidadUnitaria;
          const IvaTerceraUnitaria = IvaTercera / cantidadUnitaria;
          const PrecioVentaTotalUnitaria = PrecioVentaTotal / cantidadUnitaria;

          console.log(SubtotalPrecioVentaUnitario)
          console.log(IvaTerceraUnitaria)
          console.log(PrecioVentaTotalUnitaria)



          //******************************************************************************************************** */
          //******************************************************************************************************** */



          // prices.totalCostoProduccionSinIva = SubTotalAntesDeIva,
          // prices.totalCostoProduccion = TotalCostoDelProducto; // yeison
          // prices.valueSinIva = SubtotalPrecioVenta;
          // prices.valueConIva = PrecioVentaTotal;
          // prices.totalValue = SubtotalPrecioVenta;
          // prices.value = SubtotalPrecioVentaUnitario;



          //******************************************************************************************************** */

          prices.totalCostoProduccionSinIva = SubTotalAntesDeIva,
          prices.totalCostoProduccion = TotalCostoDelProducto;
          prices.valueSinIva = SubtotalPrecioVenta;
          prices.valueConIva = PrecioVentaTotal;
          prices.totalValue = SubtotalPrecioVenta;
          prices.value = SubtotalPrecioVentaUnitario;
          prices.valueIva = PrecioVentaTotalUnitaria; 



          burnPriceTable.push(prices);
          console.log(value)

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
}
