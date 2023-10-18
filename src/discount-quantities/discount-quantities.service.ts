import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateDiscountQuantityDto } from './dto/create-discount-quantity.dto';
import { UpdateDiscountQuantityDto } from './dto/update-discount-quantity.dto';
import { DiscountQuantity } from './entities/discount-quantity.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DiscountQuantitiesService {
  constructor(
    @InjectRepository(DiscountQuantity)
    private readonly discountQuantityRepository: Repository<DiscountQuantity>,
  ) { }

  async create(createDiscountQuantityDto: CreateDiscountQuantityDto) {
    const newDiscountQuantity = plainToClass(DiscountQuantity, createDiscountQuantityDto);

    await this.discountQuantityRepository.save(newDiscountQuantity);

    return {
      newDiscountQuantity
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.discountQuantityRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const discountQuantity = await this.discountQuantityRepository.findOne({
      where: {
        id,
      },
    });

    if (!discountQuantity)
      throw new NotFoundException(`Discount quantity with id ${id} not found`);

    return {
      discountQuantity
    };
  }

  async update(id: string, updateDiscountQuantityDto: UpdateDiscountQuantityDto) {
    const discountQuantity = await this.discountQuantityRepository.findOne({
      where: {
        id
      },
    });

    if (!discountQuantity)
      throw new NotFoundException(`Discount quantity with id ${id} not found`);

    const updatedDiscountQuantity = plainToClass(DiscountQuantity, updateDiscountQuantityDto);

    Object.assign(discountQuantity, updatedDiscountQuantity);

    await this.discountQuantityRepository.save(discountQuantity);

    return {
      discountQuantity
    };
  }

  async desactivate(id: string) {
    const { discountQuantity } = await this.findOne(id);

    discountQuantity.isActive = !discountQuantity.isActive;

    await this.discountQuantityRepository.save(discountQuantity);

    return {
      discountQuantity
    };
  }

  async remove(id: string) {
    const { discountQuantity } = await this.findOne(id);

    await this.discountQuantityRepository.remove(discountQuantity);

    return {
      discountQuantity
    };
  }
}
