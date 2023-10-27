import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { MarkedServicePricesService } from './marked-service-prices.service';
import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('marked-service-prices')
export class MarkedServicePricesController {
  constructor(private readonly markedServicePricesService: MarkedServicePricesService) { }

  @Post()
  create(@Body() createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    return this.markedServicePricesService.create(createMarkedServicePriceDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markedServicePricesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkedServicePriceDto: UpdateMarkedServicePriceDto
  ) {
    return this.markedServicePricesService.update(id, updateMarkedServicePriceDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markedServicePricesService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.remove(id);
  }
}
