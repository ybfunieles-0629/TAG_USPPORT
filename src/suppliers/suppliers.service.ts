import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SupplierType } from '../supplier-types/entities/supplier-type.entity';
import { SubSupplierProductType } from '../sub-supplier-product-types/entities/sub-supplier-product-type.entity';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger = new Logger('SuppliersService');

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(SupplierType)
    private readonly supplierTypeRepository: Repository<SupplierType>,

    @InjectRepository(SubSupplierProductType)
    private readonly subSupplierProductTypeRepository: Repository<SubSupplierProductType>,
  ) { }

  async create(createSupplierDto: CreateSupplierDto) {
      const newSupplier = plainToClass(Supplier, createSupplierDto);

      const supplierType = await this.supplierTypeRepository.findOneBy({ id: createSupplierDto.supplierType });

      if (!supplierType)
        throw new NotFoundException(`Supplier type with id ${createSupplierDto.supplierType} not found`);

      newSupplier.supplierType = supplierType;

      const subSupplierProductType = await this.subSupplierProductTypeRepository.findOneBy({ id: createSupplierDto.subSupplierProductType });

      if (!subSupplierProductType)
        throw new NotFoundException(`Sub supplier product type with id ${createSupplierDto.subSupplierProductType} not found`);

      newSupplier.subSupplierProductType = subSupplierProductType;

      await this.supplierRepository.save(newSupplier);

      return {
        newSupplier
      };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.supplierRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let supplier: Supplier;

    if (isUUID(term)) {
      supplier = await this.supplierRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.supplierRepository.createQueryBuilder();

      supplier = await queryBuilder
        .where('LOWER(name) =: name')
        .getOne();
    }

    if (!supplier)
      throw new NotFoundException(`Supplier with ${term} not found`);

    return {
      supplier
    };
  }

  // async update(id: string, updateSupplierDto: UpdateSupplierDto) {
  //   const supplier = await this.supplierRepository.preload({
  //     id,
  //     ...updateSupplierDto
  //   });

  //   if (!supplier)
  //     throw new NotFoundException(`Supplier with id ${id} not found`);

  //   await this.supplierRepository.save(supplier);

  //   return {
  //     supplier
  //   };
  // }

  async desactivate(id: string) {
    const supplier = await this.supplierRepository.findOneBy({ id });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);

    supplier.isActive = !supplier.isActive;

    await this.supplierRepository.save(supplier);

    return {
      supplier
    };
  }

  async remove(id: string) {
    const supplier = await this.supplierRepository.findOneBy({ id });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);

    await this.supplierRepository.remove(supplier);

    return {
      supplier
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
