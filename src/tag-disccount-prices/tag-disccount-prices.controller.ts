import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';

import { TagDisccountPricesService } from './tag-disccount-prices.service';
import { CreateTagDisccountPriceDto } from './dto/create-tag-disccount-price.dto';
import { UpdateTagDisccountPriceDto } from './dto/update-tag-disccount-price.dto';

@Controller('tag-disccount-prices')
export class TagDisccountPricesController {
  constructor(private readonly tagDisccountPricesService: TagDisccountPricesService) { }

  @Post()
  create(
    @Body() createTagDisccountPriceDto: CreateTagDisccountPriceDto,
  ) {
    return this.tagDisccountPricesService.create(createTagDisccountPriceDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.tagDisccountPricesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDisccountPriceDto: UpdateTagDisccountPriceDto
  ) {
    return this.tagDisccountPricesService.update(id, updateTagDisccountPriceDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.remove(id);
  }
}
