import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { OrderListDetailsService } from './order-list-details.service';
import { CreateOrderListDetailDto } from './dto/create-order-list-detail.dto';
import { UpdateOrderListDetailDto } from './dto/update-order-list-detail.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('order-list-details')
export class OrderListDetailsController {
  constructor(private readonly orderListDetailsService: OrderListDetailsService) { }

  @Post()
  create(@Body() createOrderListDetailDto: CreateOrderListDetailDto) {
    return this.orderListDetailsService.create(createOrderListDetailDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.orderListDetailsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderListDetailsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderListDetailDto: UpdateOrderListDetailDto
  ) {
    return this.orderListDetailsService.update(id, updateOrderListDetailDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderListDetailsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.orderListDetailsService.remove(id);
  }
}
