import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateCommercialQualificationDto } from './dto/create-commercial-qualification.dto';
import { UpdateCommercialQualificationDto } from './dto/update-commercial-qualification.dto';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { CommercialQualification } from './entities/commercial-qualification.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CommercialQualificationService {
  constructor(
    @InjectRepository(CommercialQualification)
    private readonly commercialQualificationRepository: Repository<CommercialQualification>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) { }

  async create(createCommercialQualificationDto: CreateCommercialQualificationDto) {
    const newCommercialQualification = plainToClass(CommercialQualification, createCommercialQualificationDto);

    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id: createCommercialQualificationDto.purchaseOrder,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${createCommercialQualificationDto.purchaseOrder} not found`);

    if (!purchaseOrder.isActive)
      throw new BadRequestException(`Purchase order with id ${createCommercialQualificationDto.purchaseOrder} is currently inactive`);

    newCommercialQualification.purchaseOrder = purchaseOrder;

    return {
      newCommercialQualification
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.commercialQualificationRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'purchaseOrder',
      ],
    });
  }

  async findOne(id: string) {
    const commercialQualification = await this.commercialQualificationRepository.findOne({
      where: {
        id,
      },
      relations: [
        'purchaseOrder',
      ],
    });

    if (!commercialQualification)
      throw new NotFoundException(`Commercial order with id ${id} not found`);

    return {
      commercialQualification
    };
  }

  async update(id: string, updateCommercialQualificationDto: UpdateCommercialQualificationDto) {
    const commercialQualification = await this.commercialQualificationRepository.findOne({
      where: {
        id,
      },
      relations: [
        'purchaseOrder',
      ],
    });

    if (!commercialQualification)
      throw new NotFoundException(`Commercial order with id ${id} not found`);

    const updatedCommercialOrder = plainToClass(CommercialQualification, updateCommercialQualificationDto);

    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id: updateCommercialQualificationDto.purchaseOrder,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${updateCommercialQualificationDto.purchaseOrder} not found`);

    if (!purchaseOrder.isActive)
      throw new BadRequestException(`Purchase order with id ${updateCommercialQualificationDto.purchaseOrder} is currently inactive`);

    updatedCommercialOrder.purchaseOrder = purchaseOrder;

    Object.assign(commercialQualification, updatedCommercialOrder);

    await this.commercialQualificationRepository.save(commercialQualification);

    return {
      commercialQualification
    };
  }

  async desactivate(id: string) {
    const { commercialQualification } = await this.findOne(id);
  
    commercialQualification.isActive = !commercialQualification.isActive;

    await this.commercialQualificationRepository.save(commercialQualification);

    return {
      commercialQualification
    };
  }

  async remove(id: string) {
    const { commercialQualification } = await this.findOne(id);
  
    await this.commercialQualificationRepository.remove(commercialQualification);

    return {
      commercialQualification
    };
  }
}
