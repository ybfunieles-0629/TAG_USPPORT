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
import { Packing } from 'src/packings/entities/packing.entity';

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

    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,

    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  async create(createRefProductDto: CreateRefProductDto) {
    const { height, large, width } = createRefProductDto;

    const volume: number = (height * large * width);

    const newRefProduct = plainToClass(RefProduct, createRefProductDto);

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
          throw new NotFoundException(`Marking with id ${categorySupplierId} not found`);

        if (!categorySupplier.isActive)
          throw new BadRequestException(`Marking with id ${categorySupplierId} is currently inactive`);

        categorySuppliers.push(categorySupplier);
      }
    }

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
    newRefProduct.deliveryTimes = deliveryTimes;
    newRefProduct.variantReferences = variantReferences;
    newRefProduct.supplier = supplier;

    await this.refProductRepository.save(newRefProduct);

    return {
      newRefProduct
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const totalCount = await this.refProductRepository.count();

    const { limit = totalCount, offset = 0 } = paginationDto;

    const results: RefProduct[] = await this.refProductRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'images',
        'categorySuppliers',
        'deliveryTimes',
        'markingServiceProperty',
        'markingServiceProperty.externalSubTechnique',
        'markingServiceProperty.externalSubTechnique.marking',
        'packings',
        'products',
        'products.refProduct',
        'products.refProduct.deliveryTimes',
        'products.refProduct.supplier',
        'products.refProduct.supplier.disccounts',
        'products.colors',
        'products.variantReferences',
        'products.packings',
        'products.supplierPrices',
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

    const staticQuantities: number[] = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
      150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000,
      7000, 8000, 9000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
      100000, 200000,
    ];

    const finalResults = await Promise.all(results.map(async (result) => {
      const modifiedProducts = await Promise.all(result.products.map(async (product) => {
        const burnPriceTable = [];

        const initialValue: number = product.referencePrice;
        let changingValue: number = initialValue;

        for (let i = 0; i < staticQuantities.length; i++) {
          let prices = {
            quantity: staticQuantities[i],
            value: changingValue,
          };

          burnPriceTable.push(prices);

          const percentageDiscount: number = 0.01;

          let value: number = changingValue * (1 - percentageDiscount);

          value = Math.round(value);

          //* SI EL PRODUCTO NO TIENE UN PRECIO NETO
          if (product.hasNetPrice == 0) {
            product.supplierPrices.forEach((supplierPrice: SupplierPrice) => {
              supplierPrice.listPrices.forEach((listPrice: ListPrice) => {
                if (listPrice.minimun >= i && listPrice.nextMinValue == 1 && listPrice.maximum <= i || listPrice.minimun >= i && listPrice.nextMinValue == 0) {
                  //* SI APLICA PARA TABLA DE PRECIOS DE PROVEEDOR
                  value = listPrice.price;

                  if (product.promoDisccount > 0 || product.promoDisccount != undefined) {
                    const discount: number = (product.promoDisccount / 100) * value;

                    value -= discount;
                  } else {
                    product.refProduct.supplier.disccounts.forEach((discountItem: Disccount) => {
                      //* SI EL DESCUENTO ES DE TIPO MONTO
                      if (discountItem.disccountType.toLowerCase() == 'descuento de monto' || discountItem.disccountType.toLowerCase() == 'descuento de cantidad') {
                        discountItem.disccounts.forEach((listDiscount: Disccounts) => {
                          if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                            const discount: number = (listDiscount.disccountValue / 100) * value;

                            value = value - discount;

                            return;
                          };
                        });
                      };
                    });
                  };

                  return;
                };
              });
            });
          };

          if (product.iva > 0 || product.iva != undefined) {
            const iva: number = (product.iva / 100) * value;

            value += iva;
          };

          if (product.importedNational.toLowerCase() == 'importado') {
            const systemConfig: SystemConfig[] = await this.systemConfigRepository.find();

            const importationFee: number = (systemConfig[0].importationFee / 100) * value;

            value += importationFee;
          };

          if (product.unforeseenFee) {
            const unforeseenFee: number = (product.unforeseenFee / 100) * value;

            value += unforeseenFee;
          };

          changingValue = value;

          //* CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
          const packing: Packing = product.packings[0] || undefined;
          const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

          let totalPackingVolume: number = 0;
          let packingWeight: number = 0;

          if (packingUnities > 0 && packingUnities != undefined) {
            let boxesQuantity: number = (i / packingUnities);

            boxesQuantity = Math.round(boxesQuantity) + 1;

            //* CALCULAR EL VOLUMEN DEL PAQUETE
            const packingVolume: number = (packing?.height * packing?.width * packing?.height) || 0;
            const totalVolume: number = (packingVolume * boxesQuantity) || 0;
            totalPackingVolume = totalVolume || 0;

            //* CALCULAR EL PESO DEL PAQUETE
            packingWeight = (packing?.smallPackingWeight * boxesQuantity) || 0;
          }

          //* IDENTIFICAR PORCENTAJE DE ANTICIPIO
          const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;

          //* IDENTIFICAR TIEMPO DE ENTREGA ACORDE AL PRODUCTO
          const availableUnits: number = product?.availableUnit || 0;
          let deliveryTimeToSave: number;

          if (i > availableUnits) {
            product.refProduct.deliveryTimes.forEach((deliveryTime: DeliveryTime) => {
              if (deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 1 && deliveryTime?.maximum <= i || deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 0) {
                deliveryTimeToSave = deliveryTime?.timeInDays || 0;
                return;
              }
            });
          } else if (availableUnits > 0 && i < availableUnits) {
            deliveryTimeToSave = product?.refProduct?.productInventoryLeadTime || 0;
            return;
          };

          //TODO: CALCULAR COSTOS FINANCIEROS DEL PERIODO DE PRODUCCIÓN
          //* --------------------------------------------
          //* --------------------------------------------
          //* --------------------------------------------
          //* --------------------------------------------

          //TODO: CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)


          //* CALCULAR EL IMPUESTO 4 X 1000
          value += (value * 1.04);

          //* CALCULAR EL COSTO DE LA OPERACIÓN (YA HECHO)

          //* ADICIONAR EL % DE MARGEN DE GANANCIA SOBRE EL PROVEEDOR
          value += product?.refProduct?.supplier?.profitMargin || 0;

          //* ADICIONAR EL % DE MARGEN DE GANANCIA DEL PRODUCTO
          const mainCategory: CategorySupplier = await this.categorySupplierRepository.findOne({
            where: {
              id: product?.refProduct?.mainCategory,
            },
          });

          if (mainCategory) {
            value += +mainCategory?.categoryTag?.categoryMargin || 0;
          };
          
          //* PRECIO TOTAL ANTES DEL IVA (YA HECHO)
          

          //* CALCULAR EL PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
          value = Math.round(value);
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

    return {
      totalCount,
      results: finalResults,
    };
  }

  async findOne(id: string) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'images',
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

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    return {
      refProduct
    };
  }

  async filterProducts(filterRefProductsDto: FilterRefProductsDto, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

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

        const mainCategoryId = categoryTag.mainCategory;
        const parentCategoryId = categoryTag.parentCategory;

        const categorySuppliersWithTagId: CategorySupplier[] = await this.categorySupplierRepository
          .createQueryBuilder('categorySupplier')
          .leftJoinAndSelect('categorySupplier.refProducts', 'refProducts')
          .leftJoinAndSelect('refProducts.images', 'images')
          .leftJoinAndSelect('refProducts.products', 'products')
          .leftJoinAndSelect('categorySupplier.categoryTag', 'categoryTag')
          .where('categoryTag.id =:categoryTagId', { categoryTagId })
          .getMany();

        const categorySuppliersWithMainId: CategorySupplier[] = await this.categorySupplierRepository
          .createQueryBuilder('categorySupplier')
          .leftJoinAndSelect('categorySupplier.refProducts', 'refProducts')
          .leftJoinAndSelect('refProducts.images', 'images')
          .leftJoinAndSelect('refProducts.products', 'products')
          .leftJoinAndSelect('categorySupplier.categoryTag', 'categoryTag')
          .where('categoryTag.id =:mainCategoryId', { mainCategoryId })
          .getMany();

        const categorySuppliersWithParentId: CategorySupplier[] = await this.categorySupplierRepository
          .createQueryBuilder('categorySupplier')
          .leftJoinAndSelect('categorySupplier.refProducts', 'refProducts')
          .leftJoinAndSelect('refProducts.images', 'images')
          .leftJoinAndSelect('refProducts.products', 'products')
          .leftJoinAndSelect('categorySupplier.categoryTag', 'categoryTag')
          .where('categoryTag.id =:parentCategoryId', { parentCategoryId })
          .getMany();

        const promisesTagId: Promise<void>[] = categorySuppliersWithTagId.map(async (categorySupplier: CategorySupplier) => {
          const refProducts: RefProduct[] = await this.refProductRepository.find({
            where: {
              mainCategory: categorySupplier.id,
            },
            relations: [
              'images',
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

          refProductsToShow.push(...refProducts);
        });

        const promisesMainId: Promise<void>[] = categorySuppliersWithMainId.map(async (categorySupplier: CategorySupplier) => {
          const refProducts: RefProduct[] = await this.refProductRepository.find({
            where: {
              mainCategory: categorySupplier.id,
            },
            relations: [
              'images',
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

          refProductsToShow.push(...refProducts);
        });

        const promisesParentId: Promise<void>[] = categorySuppliersWithParentId.map(async (categorySupplier: CategorySupplier) => {
          const refProducts: RefProduct[] = await this.refProductRepository.find({
            where: {
              mainCategory: categorySupplier.id,
            },
            relations: [
              'images',
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

          refProductsToShow.push(...categorySupplier.refProducts, ...refProducts);
        });

        await Promise.all([...promisesMainId, ...promisesParentId, ...promisesTagId]);
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.colors', 'productColors')
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.colors', 'productColors')
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
            if (refProduct.products && refProduct.products.length > 0) {
              refProduct.products.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
            }
          });
        } else {
          const refProducts: RefProduct[] = await this.refProductRepository
            .createQueryBuilder('refProduct')
            .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
            .leftJoinAndSelect('refProduct.packings', 'packings')
            .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
            .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
            .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
            .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
            .leftJoinAndSelect('refProduct.supplier', 'supplier')
            .leftJoinAndSelect('supplier.user', 'user')
            .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
            .leftJoinAndSelect('refProduct.images', 'images')
            .leftJoinAndSelect('refProduct.products', 'product')
            .leftJoinAndSelect('product.images', 'productImages')
            .leftJoinAndSelect('product.colors', 'productColors')
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
              refProduct.products.sort((a, b) => b.disccountPromo - a.disccountPromo);
            }
          });
        } else {
          const refProducts: RefProduct[] = await this.refProductRepository
            .createQueryBuilder('refProduct')
            .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
            .leftJoinAndSelect('refProduct.packings', 'packings')
            .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
            .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
            .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
            .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
            .leftJoinAndSelect('refProduct.supplier', 'supplier')
            .leftJoinAndSelect('supplier.user', 'user')
            .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
            .leftJoinAndSelect('refProduct.images', 'images')
            .leftJoinAndSelect('refProduct.products', 'product')
            .leftJoinAndSelect('product.images', 'productImages')
            .leftJoinAndSelect('product.colors', 'productColors')
            .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
            .leftJoinAndSelect('product.packings', 'productPackings')
            .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
            .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
            .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
            .orderBy('product.disccountPromo', 'DESC')
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
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.colors', 'productColors')
          .orderBy('product.referencePrice', 'ASC')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
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

          return keywordsArray.every(keyword => productKeywords.includes(keyword));
        });
      } else {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .leftJoinAndSelect('refProduct.deliveryTimes', 'deliveryTimes')
          .leftJoinAndSelect('refProduct.packings', 'packings')
          .leftJoinAndSelect('refProduct.categorySuppliers', 'categorySuppliers')
          .leftJoinAndSelect('refProduct.markingServiceProperty', 'markingServiceProperty')
          .leftJoinAndSelect('markingServiceProperty.externalSubTechnique', 'externalSubTechnique')
          .leftJoinAndSelect('externalSubTechnique.marking', 'marking')
          .leftJoinAndSelect('refProduct.supplier', 'supplier')
          .leftJoinAndSelect('supplier.user', 'user')
          .leftJoinAndSelect('refProduct.variantReferences', 'variantReferences')
          .leftJoinAndSelect('refProduct.images', 'images')
          .leftJoinAndSelect('refProduct.products', 'product')
          .leftJoinAndSelect('product.images', 'productImages')
          .leftJoinAndSelect('product.colors', 'productColors')
          .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
          .leftJoinAndSelect('product.packings', 'productPackings')
          .leftJoinAndSelect('product.markingServiceProperties', 'markingServiceProperties')
          .leftJoinAndSelect('markingServiceProperties.externalSubTechnique', 'markingExternalSubTechnique')
          .leftJoinAndSelect('markingExternalSubTechnique.marking', 'markingExternalSubTechniqueMarking')
          .where(
            keywordsArray.map(keyword => `LOWER(refProduct.keywords) REGEXP :keyword`).join(' OR '),
            { keyword: keywordsArray }
          )
          .getMany();

        refProductsToShow.push(...refProducts)
      };
    };

    refProductsToShow = refProductsToShow.filter((refProduct) => refProduct.products.length > 0);

    const finalResults = await Promise.all(refProductsToShow.map(async (result) => {
      const modifiedProducts = await Promise.all(result.products.map(async (product) => {
        const burnPriceTable = [];

        const initialValue: number = product.referencePrice;
        let changingValue: number = initialValue;

        const staticQuantities: number[] = [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
          150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
          1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000,
          7000, 8000, 9000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
          100000, 200000,
        ];

        for (let i = 0; i < staticQuantities.length; i++) {
          let prices = {
            quantity: staticQuantities[i],
            value: changingValue,
          };

          burnPriceTable.push(prices);

          const percentageDiscount: number = 0.01;

          let value: number = changingValue * (1 - percentageDiscount);

          value = Math.round(value);

          changingValue = value;
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

    const paginatedRefProducts = finalResults.slice(offset, offset + limit);

    return {
      count: finalResults.length,
      refProducts: paginatedRefProducts
    };
  }

  async filterReferencesByIsAllowed(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const refProducts: RefProduct[] = await this.refProductRepository.find({
      relations: [
        'images',
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

  async update(id: string, updateRefProductDto: UpdateRefProductDto) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
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

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    const updatedRefProduct = plainToClass(RefProduct, updateRefProductDto);

    const joinedKeywords: string = updateRefProductDto.keywords.join(';') + ';';

    updatedRefProduct.keywords = joinedKeywords;

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: updateRefProductDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Suppplier with id ${updateRefProductDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${updateRefProductDto.supplier} is currently inactive`);

    if (updateRefProductDto.categorySuppliers) {
      const categorySuppliers: CategorySupplier[] = [];

      for (const categorySupplierId of updateRefProductDto.categorySuppliers) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: categorySupplierId,
          },
        });

        if (!categorySupplier)
          throw new NotFoundException(`Marking with id ${categorySupplierId} not found`);

        if (!categorySupplier.isActive)
          throw new BadRequestException(`Marking with id ${categorySupplierId} is currently inactive`);

        categorySuppliers.push(categorySupplier);
      }

      updatedRefProduct.categorySuppliers = categorySuppliers;
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

    updatedRefProduct.supplier = supplier;

    Object.assign(refProduct, updatedRefProduct);

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async desactivate(id: string) {
    const { refProduct } = await this.findOne(id);

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
    const { refProduct } = await this.findOne(id);

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
