import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { OrderRatingsService } from './order-ratings.service';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { UpdateOrderRatingDto } from './dto/update-order-rating.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('order-ratings')
export class OrderRatingsController {
  constructor(private readonly orderRatingsService: OrderRatingsService) { }

  @Post()
  create(@Body() createOrderRatingDto: CreateOrderRatingDto) {
    return this.orderRatingsService.create(createOrderRatingDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderRatingsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderRatingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderRatingDto: UpdateOrderRatingDto
  ) {
    return this.orderRatingsService.update(id, updateOrderRatingDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderRatingsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderRatingsService.remove(id);
  }
}
