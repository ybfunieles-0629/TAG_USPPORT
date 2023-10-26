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

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createDeliveryTimeDto: CreateDeliveryTimeDto) {
    const newDeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createDeliveryTimeDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createDeliveryTimeDto.refProduct} not found`);

    newDeliveryTime.refProduct = refProduct;

    await this.deliveryTimeRepository.save(newDeliveryTime);

    return {
      newDeliveryTime
    };
  }

  async createMultiple(createMultipleDeliveryTimes: CreateDeliveryTimeDto[]) {
    const createdDeliveryTimes = [];

    for (const createDeliveryTimeDto of createMultipleDeliveryTimes) {
      const newDeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

      const refProduct = await this.refProductRepository.findOne({
        where: {
          id: createDeliveryTimeDto.refProduct,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product with id ${createDeliveryTimeDto.refProduct} not found`);

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
        'refProduct',
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
        'refProduct',
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
        'refProduct',
      ],
    });

    const updatedDeliveryTime = plainToClass(DeliveryTime, updateDeliveryTimeDto);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updateDeliveryTimeDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updateDeliveryTimeDto.refProduct} not found`);

    updatedDeliveryTime.refProduct = refProduct;

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
      });

      if (!deliveryTime)
        throw new NotFoundException(`Delivery time with id ${id} not found`);

      const refProduct = await this.refProductRepository.findOne({
        where: {
          id: updateDeliveryTimeDto.refProduct,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product with id ${updateDeliveryTimeDto.refProduct} not found`);

      Object.assign(deliveryTime, dataToUpdate);

      deliveryTime.refProduct = refProduct;

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
