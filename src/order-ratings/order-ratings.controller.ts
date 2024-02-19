import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OrderRatingsService } from './order-ratings.service';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { UpdateOrderRatingDto } from './dto/update-order-rating.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('order-ratings')
export class OrderRatingsController {
  constructor(private readonly orderRatingsService: OrderRatingsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createOrderRatingDto: CreateOrderRatingDto,
    @GetUser() user: User
  ) {
    return this.orderRatingsService.create(createOrderRatingDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderRatingsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderRatingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderRatingDto: UpdateOrderRatingDto,
    @GetUser() user: User,
  ) {
    return this.orderRatingsService.update(id, updateOrderRatingDto, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderRatingsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderRatingsService.remove(id);
  }
}
