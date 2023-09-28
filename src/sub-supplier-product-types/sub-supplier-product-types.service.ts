import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { CreateSubSupplierProductTypeDto } from './dto/create-sub-supplier-product-type.dto';
import { UpdateSubSupplierProductTypeDto } from './dto/update-sub-supplier-product-type.dto';
import { SubSupplierProductType } from './entities/sub-supplier-product-type.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SubSupplierProductTypesService {
  private readonly logger: Logger = new Logger('SubSupplierProductTypesService');

  constructor(
    @InjectRepository(SubSupplierProductType)
    private readonly subSupplierProductTypeRepository: Repository<SubSupplierProductType>,
  ) { }

  async create(createSubSupplierProductTypeDto: CreateSubSupplierProductTypeDto) {
    try {
      const supplierType = this.subSupplierProductTypeRepository.create(createSubSupplierProductTypeDto);

      await this.subSupplierProductTypeRepository.save(supplierType);

      return {
        supplierType
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.subSupplierProductTypeRepository.find({
      take: limit,
      skip: offset,
    });
  }
  async findOne(term: string) {
    let subSupplierProductType: SubSupplierProductType;

    if (isUUID(term)) {
      subSupplierProductType = await this.subSupplierProductTypeRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.subSupplierProductTypeRepository.createQueryBuilder();

      subSupplierProductType = await queryBuilder
        .where('LOWER(name) =:name', {
          name: term.toLowerCase()
        })
        .getOne()
    }

    if (!subSupplierProductType)
      throw new NotFoundException(`Sub supplier product type with ${subSupplierProductType} not found`);

    return {
      subSupplierProductType
    };
  }

  async update(id: string, updateSubSupplierProductTypeDto: UpdateSubSupplierProductTypeDto) {
    const subSupplierProductType = await this.subSupplierProductTypeRepository.preload({
      id,
      ...updateSubSupplierProductTypeDto
    });

    if (!subSupplierProductType)
      throw new NotFoundException(`Sub supplier product type with id ${id} not found`);

    await this.subSupplierProductTypeRepository.save(subSupplierProductType);

    return {
      subSupplierProductType
    };
  }

  async remove(id: string) {
    const subSupplierProductType = await this.subSupplierProductTypeRepository.findOneBy({ id });

    if (!subSupplierProductType)
      throw new NotFoundException(`Sub supplier product type with id ${id} not found`);

    await this.subSupplierProductTypeRepository.remove(subSupplierProductType);

    return {
      subSupplierProductType
    };
  }

  private handleDbExceptions(error: any) {

  }
}
