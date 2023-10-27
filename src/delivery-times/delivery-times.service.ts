import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateDeliveryTimeDto } from './dto/create-delivery-time.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-time.dto';
import { DeliveryTime } from './entities/delivery-time.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class DeliveryTimesService {
  private readonly logger: Logger = new Logger('DeliveryTimesService');

  constructor(
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,
  ) { }

  async create(createDeliveryTimeDto: CreateDeliveryTimeDto) {
    const newDeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

    await this.deliveryTimeRepository.save(newDeliveryTime);

    return {
      newDeliveryTime
    };
  }

  async createMultiple(createMultipleDeliveryTimes: CreateDeliveryTimeDto[]) {
    const createdDeliveryTimes: DeliveryTime[] = [];

    for (const createDeliveryTimeDto of createMultipleDeliveryTimes) {
      const newDeliveryTime: DeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

      await this.deliveryTimeRepository.save(newDeliveryTime);
      
      createdDeliveryTimes.push(newDeliveryTime);
    }

    return {
      createdDeliveryTimes,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.deliveryTimeRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'supplier',
        'product',
        'refProducts',
      ],
    });
  }

  async findOne(id: string) {
    const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplier',
        'product',
        'refProducts',
      ],
    });

    if (!deliveryTime)
      throw new NotFoundException(`Delivery time with id ${id} not found`);

    return {
      deliveryTime
    };
  }

  async update(id: string, updateDeliveryTimeDto: UpdateDeliveryTimeDto) {
    const deliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplier',
        'product',
        'refProducts',
      ],
    });

    const updatedDeliveryTime = plainToClass(DeliveryTime, updateDeliveryTimeDto);

    Object.assign(deliveryTime, updatedDeliveryTime);

    await this.deliveryTimeRepository.save(deliveryTime);

    return {
      deliveryTime
    };
  }

  async updateMultiple(updateMultipleDeliveryTimes: UpdateDeliveryTimeDto[]) {
    const updatedDeliveryTimes = [];

    for (const updateDeliveryTimeDto of updateMultipleDeliveryTimes) {
      const { id, ...dataToUpdate } = updateDeliveryTimeDto;

      const deliveryTime = await this.deliveryTimeRepository.findOne({
        where: {
          id
        },
        relations: [
          'refProducts',
        ],
      });

      if (!deliveryTime)
        throw new NotFoundException(`Delivery time with id ${id} not found`);
     
      Object.assign(deliveryTime, dataToUpdate);

      await this.deliveryTimeRepository.save(deliveryTime);

      updatedDeliveryTimes.push(deliveryTime);
    }

    return {
      updatedDeliveryTimes,
    };
  }

  async remove(id: string) {
    const { deliveryTime } = await this.findOne(id);

    await this.deliveryTimeRepository.remove(deliveryTime);

    return {
      deliveryTime
    };
  }
}
