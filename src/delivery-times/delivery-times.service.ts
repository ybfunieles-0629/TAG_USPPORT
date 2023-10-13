import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateDeliveryTimeDto } from './dto/create-delivery-time.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-time.dto';
import { DeliveryTime } from './entities/delivery-time.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DeliveryTimesService {
  private readonly logger: Logger = new Logger('DeliveryTimesService');

  constructor(
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>
  ) { }

  async create(createDeliveryTimeDto: CreateDeliveryTimeDto) {
    const newDeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

    await this.deliveryTimeRepository.save(newDeliveryTime);

    return {
      newDeliveryTime
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.deliveryTimeRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id,
      },
    });

    if (!deliveryTime)
      throw new NotFoundException(`Delivery time with id ${id} not found`);

    return {
      deliveryTime
    };
  }

  async update(id: string, updateDeliveryTimeDto: UpdateDeliveryTimeDto) {
    const { deliveryTime } = await this.findOne(id);

    const updatedDeliveryTime = plainToClass(DeliveryTime, updateDeliveryTimeDto);

    Object.assign(deliveryTime, updatedDeliveryTime);

    await this.deliveryTimeRepository.save(deliveryTime);

    return {
      deliveryTime
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
