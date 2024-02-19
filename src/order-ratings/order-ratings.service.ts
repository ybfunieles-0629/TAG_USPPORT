import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { UpdateOrderRatingDto } from './dto/update-order-rating.dto';
import { OrderRating } from './entities/order-rating.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrderRatingsService {
  constructor(
    @InjectRepository(OrderRating)
    private readonly orderRatingService: Repository<OrderRating>,
  ) { }

  async create(createOrderRatingDto: CreateOrderRatingDto, user: User) {
    const orderRating: OrderRating = plainToClass(OrderRating, createOrderRatingDto);
  
    orderRating.createdBy = user.id;

    await this.orderRatingService.save(orderRating);

    return {
      orderRating
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.orderRatingService.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: OrderRating[] = await this.orderRatingService.find({
      take: limit,
      skip: offset,
      relations: [
        'orderListDetail',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const orderRating: OrderRating = await this.orderRatingService.findOne({
      where: {
        id,
      },
      relations: [
        'orderListDetail',
      ],
    });

    if (!orderRating)
      throw new NotFoundException(`Order rating with id ${id} not found`);

    return {
      orderRating
    };
  }

  async update(id: string, updateOrderRatingDto: UpdateOrderRatingDto, user: User) {
    const orderRating: OrderRating = await this.orderRatingService.findOne({
      where: {
        id,
      },
      relations: [
        'orderListDetail',
      ],
    });

    if (!orderRating)
      throw new NotFoundException(`Order rating with id ${id} not found`);

    const updatedOrderRating: OrderRating = plainToClass(OrderRating, updateOrderRatingDto);

    updatedOrderRating.updatedBy = user.id;

    Object.assign(orderRating, updatedOrderRating);
  
    await this.orderRatingService.save(orderRating);

    return {
      orderRating
    };
  }

  async desactivate(id: string) {
    const { orderRating } = await this.findOne(id);

    orderRating.isActive = !orderRating.isActive;

    await this.orderRatingService.save(orderRating);

    return {
      orderRating
    };
  }

  async remove(id: string) {
    const { orderRating } = await this.findOne(id);

    await this.orderRatingService.remove(orderRating);

    return {
      orderRating
    };
  }
}
