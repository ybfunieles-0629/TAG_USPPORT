import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaginationDto } from '../common/dto/pagination.dto';
import { TagDisccountPricesService } from './tag-disccount-prices.service';
import { CreateTagDisccountPriceDto } from './dto/create-tag-disccount-price.dto';
import { UpdateTagDisccountPriceDto } from './dto/update-tag-disccount-price.dto';

@Controller('tag-disccount-prices')
export class TagDisccountPricesController {
  constructor(private readonly tagDisccountPricesService: TagDisccountPricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createTagDisccountPriceDto: CreateTagDisccountPriceDto,
  ) {
    return this.tagDisccountPricesService.create(createTagDisccountPriceDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.tagDisccountPricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDisccountPriceDto: UpdateTagDisccountPriceDto
  ) {
    return this.tagDisccountPricesService.update(id, updateTagDisccountPriceDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagDisccountPricesService.remove(id);
  }
}
