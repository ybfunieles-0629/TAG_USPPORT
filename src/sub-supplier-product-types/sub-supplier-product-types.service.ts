import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  findOne(id: number) {
    return `This action returns a #${id} subSupplierProductType`;
  }

  update(id: number, updateSubSupplierProductTypeDto: UpdateSubSupplierProductTypeDto) {
    return `This action updates a #${id} subSupplierProductType`;
  }

  remove(id: number) {
    return `This action removes a #${id} subSupplierProductType`;
  }

  private handleDbExceptions(error: any) {

  }
}
