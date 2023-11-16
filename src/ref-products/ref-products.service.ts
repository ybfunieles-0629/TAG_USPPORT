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

@Injectable()
export class RefProductsService {
  private readonly logger: Logger = new Logger('RefProductsService');

  constructor(
    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

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
    const newRefProduct = plainToClass(RefProduct, createRefProductDto);

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
    const markingServiceProperties: MarkingServiceProperty[] = [];

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

    if (createRefProductDto.markingServiceProperties) {
      for (const markingServicePropertyId of createRefProductDto.markingServiceProperties) {
        const markignServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
          where: {
            id: markingServicePropertyId,
          },
        });

        if (!markignServiceProperty)
          throw new NotFoundException(`Marking service properties with id ${markingServicePropertyId} not found`);

        // if (!markignServiceProperty.isActive)
        //   throw new BadRequestException(`Variant reference with id ${markingServicePropertyId} is currently inactive`);

        markingServiceProperties.push(markignServiceProperty);
      }
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

        // if (!markignServiceProperty.isActive)
        //   throw new BadRequestException(`Variant reference with id ${markingServicePropertyId} is currently inactive`);

        deliveryTimes.push(deliveryTime);
      }
    }

    newRefProduct.categorySuppliers = categorySuppliers;
    newRefProduct.deliveryTimes = deliveryTimes;
    newRefProduct.variantReferences = variantReferences;
    newRefProduct.supplier = supplier;
    newRefProduct.markingServiceProperties = markingServiceProperties;

    await this.refProductRepository.save(newRefProduct);

    return {
      newRefProduct
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const totalCount = await this.refProductRepository.count();
  
    const { limit = totalCount, offset = 0 } = paginationDto;
  
    const results = await this.refProductRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'images',
        'categorySuppliers',
        'deliveryTimes',
        'markingServiceProperties',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
        'packings',
        'products',
        'products.colors',
        'products.variantReferences',
        'products.packings',
        'supplier',
        'supplier.user',
        'variantReferences',
      ],
    });
  
    results.forEach((refProduct) => {
      refProduct.products.sort((a, b) => a.referencePrice - b.referencePrice);
    });
  
    return {
      totalCount,
      results,
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
        'markingServiceProperties',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
        'packings',
        'products',
        'products.colors',
        'products.variantReferences',
        'products.packings',
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

  async update(id: string, updateRefProductDto: UpdateRefProductDto) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'categorySuppliers',
        'deliveryTimes',
        'markingServiceProperties',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
        'packings',
        'products',
        'products.colors',
        'products.variantReferences',
        'products.packings',
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

    if (updateRefProductDto.markingServiceProperties) {
      const markingServiceProperties: MarkingServiceProperty[] = [];

      for (const markingServicePropertyId of updateRefProductDto.markingServiceProperties) {
        const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
          where: {
            id: markingServicePropertyId,
          },
        });

        if (!markingServiceProperty)
          throw new NotFoundException(`Variant reference with id ${markingServicePropertyId} not found`);

        markingServiceProperties.push(markingServiceProperty);
      }

      updatedRefProduct.markingServiceProperties = markingServiceProperties;
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
