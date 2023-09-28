import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSupplierTypeDto } from './dto/create-supplier-type.dto';
import { UpdateSupplierTypeDto } from './dto/update-supplier-type.dto';
import { SupplierType } from './entities/supplier-type.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

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

  findOne(id: number) {
    return `This action returns a #${id} supplierType`;
  }

  update(id: number, updateSupplierTypeDto: UpdateSupplierTypeDto) {
    return `This action updates a #${id} supplierType`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplierType`;
  }

  private handleDbExceptions(error: any) {

  }
}
