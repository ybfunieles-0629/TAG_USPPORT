import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateVariantReferenceDto } from './dto/create-variant-reference.dto';
import { UpdateVariantReferenceDto } from './dto/update-variant-reference.dto';
import { VariantReference } from './entities/variant-reference.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class VariantReferenceService {
  private readonly logger: Logger = new Logger('VariantReferenceService');

  constructor(
    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  async create(createVariantReferenceDto: CreateVariantReferenceDto) {
    const newVariantReference = this.variantReferenceRepository.create(createVariantReferenceDto);

    await this.variantReferenceRepository.save(newVariantReference);

    return {
      newVariantReference
    };
  }

  async createMultiple(createMultipleVariantReferences: CreateVariantReferenceDto[]) {
    const createdVariantReferences = [];

    for (const createVariantReferenceDto of createMultipleVariantReferences) {
      const variantReference = this.variantReferenceRepository.create(createVariantReferenceDto);

      await this.variantReferenceRepository.save(variantReference);

      createdVariantReferences.push(variantReference);
    }

    return {
      createdVariantReferences,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.variantReferenceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const variantReference = await this.variantReferenceRepository.findOne({
      where: {
        id
      },
    });

    if (!variantReference)
      throw new NotFoundException(`Variant reference with id ${id} not found`);

    return {
      variantReference
    };
  }

  async findByProductReference(id: string) {
    const variantReferences: VariantReference[] = await this.variantReferenceRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.refProduct', 'refProduct')
      .where('refProduct.id =:refProductId', { refProductId: id })
      .getMany();

    if (!variantReferences)
      throw new NotFoundException(`Variant references with ref product with id ${id} not found`);

    return {
      variantReferences
    };
  };

  async update(id: string, updateVariantReferenceDto: UpdateVariantReferenceDto) {
    const variantReference = await this.variantReferenceRepository.findOne({
      where: {
        id,
      },
    });

    if (!variantReference)
      throw new NotFoundException(`Variant reference with id ${id} not found`);

    const updatedVariantReference = plainToClass(VariantReference, updateVariantReferenceDto);

    Object.assign(variantReference, updatedVariantReference);

    await this.variantReferenceRepository.save(variantReference);

    return {
      variantReference
    };
  }

  async updateMultiple(updateMultipleVariantReferences: UpdateVariantReferenceDto[]) {
    const updatedVariantReferences = [];

    for (const updateVariantReference of updateMultipleVariantReferences) {
      const { id, ...dataToUpdate } = updateVariantReference;

      const variantReference = await this.variantReferenceRepository.findOne({
        where: {
          id
        },
      });

      if (!variantReference)
        throw new NotFoundException(`Variant reference with id ${id} not found`);

      Object.assign(variantReference, dataToUpdate);

      await this.variantReferenceRepository.save(variantReference);

      updatedVariantReferences.push(variantReference);
    }

    return {
      updatedVariantReferences,
    };
  }

  async remove(id: string) {
    const { variantReference } = await this.findOne(id);

    await this.variantReferenceRepository.remove(variantReference);

    return {
      variantReference
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
