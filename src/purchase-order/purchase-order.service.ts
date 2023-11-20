import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { State } from '../states/entities/state.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const newPurchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, createPurchaseOrderDto);

    if (createPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createPurchaseOrderDto.state} is currently inactive`);

      newPurchaseOrder.state = state;
    }

    await this.purchaseOrderRepository.save(newPurchaseOrder);

    return {
      newPurchaseOrder
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.purchaseOrderRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: PurchaseOrder[] = await this.purchaseOrderRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

    return {
      purchaseOrder
    };
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

    const updatedPurchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, updatePurchaseOrderDto);

    if (updatePurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: updatePurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updatePurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${updatePurchaseOrderDto.state} is currently inactive`);

      updatedPurchaseOrder.state = state;
    }

    Object.assign(purchaseOrder, updatedPurchaseOrder);

    await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  async desactivate(id: string) {
    const { purchaseOrder } = await this.findOne(id);

    purchaseOrder.isActive = !purchaseOrder.isActive;

    await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  async remove(id: string) {
    const { purchaseOrder } = await this.findOne(id);

    await this.purchaseOrderRepository.remove(purchaseOrder);

    return {
      purchaseOrder
    };
  }
}