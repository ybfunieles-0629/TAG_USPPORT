import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { DiscountQuantitiesService } from './discount-quantities.service';
import { CreateDiscountQuantityDto } from './dto/create-discount-quantity.dto';
import { UpdateDiscountQuantityDto } from './dto/update-discount-quantity.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('discount-quantities')
export class DiscountQuantitiesController {
  constructor(private readonly discountQuantitiesService: DiscountQuantitiesService) { }

  @Post()
  create(
    @Body() createDiscountQuantityDto: CreateDiscountQuantityDto
  ) {
    return this.discountQuantitiesService.create(createDiscountQuantityDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.discountQuantitiesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.discountQuantitiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateDiscountQuantityDto: UpdateDiscountQuantityDto
  ) {
    return this.discountQuantitiesService.update(id, updateDiscountQuantityDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.discountQuantitiesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.discountQuantitiesService.remove(id);
  }
}
