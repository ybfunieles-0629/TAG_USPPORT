import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateStateChangeDto } from './dto/create-state-change.dto';
import { UpdateStateChangeDto } from './dto/update-state-change.dto';
import { SupplierPurchaseOrder } from '../supplier-purchase-orders/entities/supplier-purchase-order.entity';
import { StateChange } from './entities/state-change.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StateChangesService {
  constructor(
    @InjectRepository(StateChange)
    private readonly stateChangeRepository: Repository<StateChange>,

    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,
  ) { }

  async create(createStateChangeDto: CreateStateChangeDto, user: User) {
    const newStateChangeRepository: StateChange = plainToClass(StateChange, createStateChangeDto);

    newStateChangeRepository.createdBy = user.id;

    if (createStateChangeDto.supplierPurchaseOrder) {
      const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
        where: {
          id: createStateChangeDto.supplierPurchaseOrder,
        },
      });

      if (!supplierPurchaseOrder)
        throw new NotFoundException(`Supplier purchase order with id ${createStateChangeDto.supplierPurchaseOrder} not found`);

      if (!supplierPurchaseOrder.isActive)
        throw new BadRequestException(`Supplier purchase order with id ${createStateChangeDto.supplierPurchaseOrder} is currently inactive`);

      newStateChangeRepository.supplierPurchaseOrder = supplierPurchaseOrder;
    }

    await this.stateChangeRepository.save(newStateChangeRepository);

    return {
      newStateChangeRepository
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.stateChangeRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: StateChange[] = await this.stateChangeRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'supplierPurchaseOrder',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const stateChange: StateChange = await this.stateChangeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplierPurchaseOrder',
      ],
    });

    if (!stateChange)
      throw new NotFoundException(`State change with id ${id} not found`);

    return {
      stateChange
    };
  }

  async update(id: string, updateStateChangeDto: UpdateStateChangeDto, user: User) {
    const stateChange: StateChange = await this.stateChangeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplierPurchaseOrder',
      ],
    });

    if (!stateChange)
      throw new NotFoundException(`State change with id ${id} not found`);

    const updatedStateChange: StateChange = plainToClass(StateChange, updateStateChangeDto);

    updatedStateChange.updatedBy = user.id;

    if (updateStateChangeDto.supplierPurchaseOrder) {
      const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
        where: {
          id: updateStateChangeDto.supplierPurchaseOrder,
        },
      });

      if (!supplierPurchaseOrder)
        throw new NotFoundException(`Supplier purchase order with id ${updateStateChangeDto.supplierPurchaseOrder} not found`);

      if (!supplierPurchaseOrder.isActive)
        throw new BadRequestException(`Supplier purchase order with id ${updateStateChangeDto.supplierPurchaseOrder} is currently inactive`);

      updatedStateChange.supplierPurchaseOrder = supplierPurchaseOrder;
    };

    Object.assign(stateChange, updatedStateChange);

    await this.stateChangeRepository.save(stateChange);

    return {
      stateChange
    };
  }

  async desactivate(id: string) {
    const { stateChange } = await this.findOne(id);

    stateChange.isActive = !stateChange.isActive;

    await this.stateChangeRepository.save(stateChange);

    return {
      stateChange
    };
  }

  async remove(id: string) {
    const { stateChange } = await this.findOne(id);

    await this.stateChangeRepository.remove(stateChange);

    return {
      stateChange
    };
  }
}
