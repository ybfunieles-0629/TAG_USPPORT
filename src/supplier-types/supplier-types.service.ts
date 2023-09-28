import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSupplierTypeDto } from './dto/create-supplier-type.dto';
import { UpdateSupplierTypeDto } from './dto/update-supplier-type.dto';
import { SupplierType } from './entities/supplier-type.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class SupplierTypesService {
  private readonly logger: Logger = new Logger('SupplierTypesService');

  constructor(
    @InjectRepository(SupplierType)
    private readonly supplierTypeRepository: Repository<SupplierType>
  ) { }

  async create(createSupplierTypeDto: CreateSupplierTypeDto) {
    try {
      const supplierType = this.supplierTypeRepository.create(createSupplierTypeDto);

      await this.supplierTypeRepository.save(supplierType);

      return {
        supplierType
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.supplierTypeRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let supplierType: SupplierType;

    if (isUUID(term)) {
      supplierType = await this.supplierTypeRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.supplierTypeRepository.createQueryBuilder();

      supplierType = await queryBuilder
        .where('LOWER(name) =:name', {
          name: term.toLowerCase()
        })
        .getOne()
    }

    if (!supplierType)
      throw new NotFoundException(`Supplier type with ${supplierType} not found`);

    return {
      supplierType
    };
  }

  async update(id: string, updateSupplierTypeDto: UpdateSupplierTypeDto) {
    const supplierType = await this.supplierTypeRepository.preload({
      id,
      ...updateSupplierTypeDto
    });

    if (!supplierType)
      throw new NotFoundException(`Supplier type with id ${id} not found`);

    await this.supplierTypeRepository.save(supplierType);

    return {
      supplierType
    };
  }

  async remove(id: string) {
    const supplierType = await this.supplierTypeRepository.findOneBy({ id });

    if (!supplierType)
      throw new NotFoundException(`Supplier type with id ${id} not found`);

    await this.supplierTypeRepository.remove(supplierType);

    return {
      supplierType
    };
  }

  private handleDbExceptions(error: any) {

  }
}
