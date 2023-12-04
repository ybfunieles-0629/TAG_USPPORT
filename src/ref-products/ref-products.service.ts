import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import axios from 'axios';

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

      return { ...result, products: modifiedProducts, mainCategory: categorySupplier };
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
      const categorySuppliersFound: CategorySupplier[] = [];

      for (const categoryTagId of filterRefProductsDto.categoryTag) {
        const categoryTag: CategoryTag[] = await this.categoryTagRepository.find({
          where: {
            id: categoryTagId,
          },
          relations: [
            'categorySuppliers',
          ],
        });

        if (!categoryTag)
          throw new NotFoundException(`Category tag with id ${categoryTagId} not found`);

        categoryTag.forEach(category => {
          category.categorySuppliers.forEach(categorySupplier => {
            categorySuppliersFound.push(categorySupplier);
          });
        });
      }

      categorySuppliersFound.forEach(categorySupplier => {
        categorySupplier.refProducts.forEach(refProduct => {
          refProductsToShow.push(refProduct);
        });
      });
    };

    if (filterRefProductsDto.prices) {
      const [minPrice, maxPrice]: number[] = filterRefProductsDto.prices;

      const refProducts: RefProduct[] = await this.refProductRepository
        .createQueryBuilder('refProduct')
        .innerJoinAndSelect('refProduct.products', 'product')
        .where('product.referencePrice BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        })
        .getMany();

      refProductsToShow.push(...refProducts);
    };

    if (filterRefProductsDto.budget) {
      const budget: number = filterRefProductsDto.budget;

      const refProducts: RefProduct[] = await this.refProductRepository
        .createQueryBuilder('refProduct')
        .innerJoinAndSelect('refProduct.products', 'product')
        .andWhere('product.referencePrice <= :budget', { budget })
        .getMany();

      refProductsToShow.push(...refProducts);
    };

    if (filterRefProductsDto.inventory) {
      const inventory: number = filterRefProductsDto.inventory;

      const refProducts: RefProduct[] = await this.refProductRepository
        .createQueryBuilder('refProduct')
        .innerJoinAndSelect('refProduct.products', 'product')
        .select(['refProduct.id', 'SUM(product.availableUnit) AS totalAvailableUnit'])
        .groupBy('refProduct.id')
        .having('totalAvailableUnit < :inventory', { inventory })
        .getMany();

      refProductsToShow.push(...refProducts);
    };

    if (filterRefProductsDto.colors) {
      const colorIds: string[] = filterRefProductsDto.colors;

      const refProducts: RefProduct[] = await this.refProductRepository
        .createQueryBuilder('refProduct')
        .innerJoinAndSelect('refProduct.products', 'product')
        .andWhere('product.colors IN (:...colorIds)', { colorIds })
        .getMany();

      refProductsToShow.push(...refProducts);
    };

    if (filterRefProductsDto.variantReferences) {
      const variantReferences: string[] = filterRefProductsDto.variantReferences;

      const refProducts: RefProduct[] = await this.refProductRepository
        .createQueryBuilder('refProduct')
        .innerJoinAndSelect('refProduct.products', 'product')
        .andWhere('product.variantReferences IN (: ...variantReferences)', { variantReferences })
        .getMany();

      refProductsToShow.push(...refProducts);
    };

    if (filterRefProductsDto.isNew) {
      const isNew: boolean = filterRefProductsDto.isNew;

      if (isNew) {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .innerJoinAndSelect('refProduct.products', 'product')
          .orderBy('product.createdAt', 'DESC')
          .getMany();

        refProductsToShow.push(...refProducts);
      };
    };

    if (filterRefProductsDto.hasDiscount) {
      const hasDiscount: boolean = filterRefProductsDto.hasDiscount;

      if (hasDiscount) {
        const refProducts: RefProduct[] = await this.refProductRepository
          .createQueryBuilder('refProduct')
          .innerJoinAndSelect('refProduct.products', 'product')
          .orderBy('product.disccountPromo', 'DESC')
          .getMany();

        refProductsToShow.push(...refProducts);
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
      }
    };

    if (filterRefProductsDto.keywords) {
      const searchKeywords: string = filterRefProductsDto.keywords.toLowerCase();
      const keywordsArray: string[] = searchKeywords.split(' ');

      refProductsToShow = refProductsToShow.filter((refProduct) => {
        const productKeywords: string = (refProduct.keywords || '').toLowerCase();

        return keywordsArray.every(keyword => productKeywords.includes(keyword));
      });
    };

    const paginatedRefProducts: RefProduct[] = refProductsToShow.slice(offset, offset + limit);

    return {
      count: refProductsToShow.length,
      refProducts: paginatedRefProducts
    };
  }

  async filterReferencesByIsAllowed() {
    const refProducts: RefProduct[] = await this.refProductRepository.find({
      relations: ['products'],
    });

    const refProductsToShow: RefProduct[] = [];

    for (const refProduct of refProducts) {
      if (refProduct.isAllowed === 0 || refProduct.products.some(product => product.isAllowed === 0)) {
        refProductsToShow.push({
          ...refProduct,
          products: refProduct.products.filter(product => product.isAllowed === 0),
        });
      };
    };

    return refProductsToShow;
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
