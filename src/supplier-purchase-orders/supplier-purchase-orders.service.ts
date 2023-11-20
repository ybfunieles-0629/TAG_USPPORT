import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateSupplierPurchaseOrderDto } from './dto/create-supplier-purchase-order.dto';
import { UpdateSupplierPurchaseOrderDto } from './dto/update-supplier-purchase-order.dto';
import { SupplierPurchaseOrder } from './entities/supplier-purchase-order.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { State } from '../states/entities/state.entity';

@Injectable()
export class SupplierPurchaseOrdersService {
  constructor(
    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createSupplierPurchaseOrderDto: CreateSupplierPurchaseOrderDto) {
    const newSupplierPurchaseOrder: SupplierPurchaseOrder = plainToClass(SupplierPurchaseOrder, createSupplierPurchaseOrderDto);

    if (createSupplierPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createSupplierPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createSupplierPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createSupplierPurchaseOrderDto.state} is currently inactive`);

      newSupplierPurchaseOrder.state = state;
    }

    await this.supplierPurchaseOrderRepository.save(newSupplierPurchaseOrder);

    return {
      newSupplierPurchaseOrder
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.supplierPurchaseOrderRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SupplierPurchaseOrder[] = await this.supplierPurchaseOrderRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'state',
        'stateChanges',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
      where: {
        id,
      },
      relations: [
        'state',
        'stateChanges',
      ],
    });

    if (!supplierPurchaseOrder)
      throw new NotFoundException(`Supplier purchase order with id ${id} not found`);

    return {
      supplierPurchaseOrder
    };
  }

  async update(id: string, updateSupplierPurchaseOrderDto: UpdateSupplierPurchaseOrderDto) {
    const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
      where: {
        id,
      },
      relations: [
        'state',
        'stateChanges',
      ],
    });

    if (!supplierPurchaseOrder)
      throw new NotFoundException(`Supplier purchase order with id ${id} not found`);

    const updatedSupplierPurchaseOrder: SupplierPurchaseOrder = plainToClass(SupplierPurchaseOrder, updateSupplierPurchaseOrderDto);

    if (updateSupplierPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: updateSupplierPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updateSupplierPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${updateSupplierPurchaseOrderDto.state} is currently inactive`);

      updatedSupplierPurchaseOrder.state = state;
    }

    Object.assign(supplierPurchaseOrder, updatedSupplierPurchaseOrder);

    await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrder);

    return {
      supplierPurchaseOrder
    };
  }

  async desactivate(id: string) {
    const { supplierPurchaseOrder } = await this.findOne(id);

    supplierPurchaseOrder.isActive = !supplierPurchaseOrder.isActive;

    await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrder);
  }

  async remove(id: string) {
    const { supplierPurchaseOrder } = await this.findOne(id);

    await this.supplierPurchaseOrderRepository.remove(supplierPurchaseOrder);

    return {
      supplierPurchaseOrder
    };
  }
}
