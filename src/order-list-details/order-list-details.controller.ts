import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OrderListDetailsService } from './order-list-details.service';
import { CreateOrderListDetailDto } from './dto/create-order-list-detail.dto';
import { UpdateOrderListDetailDto } from './dto/update-order-list-detail.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('order-list-details')
export class OrderListDetailsController {
  constructor(private readonly orderListDetailsService: OrderListDetailsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createOrderListDetailDto: CreateOrderListDetailDto) {
    return this.orderListDetailsService.create(createOrderListDetailDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderListDetailsService.findAll(paginationDto, user);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderListDetailsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderListDetailDto: UpdateOrderListDetailDto
  ) {
    return this.orderListDetailsService.update(id, updateOrderListDetailDto);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderListDetailsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderListDetailsService.remove(id);
  }
}
