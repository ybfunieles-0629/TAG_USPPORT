import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { LocalTransportPricesService } from './local-transport-prices.service';
import { CreateLocalTransportPriceDto } from './dto/create-local-transport-price.dto';
import { UpdateLocalTransportPriceDto } from './dto/update-local-transport-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('local-transport-prices')
export class LocalTransportPricesController {
  constructor(private readonly localTransportPricesService: LocalTransportPricesService) { }

  @Post()
  create(@Body() createLocalTransportPriceDto: CreateLocalTransportPriceDto) {
    return this.localTransportPricesService.create(createLocalTransportPriceDto);
  }

  @Post('create/multiple')
  createMultiple(
    @Body() createLocalTransportPrices: CreateLocalTransportPriceDto[]
  ) {
    return this.localTransportPricesService.createMultiple(createLocalTransportPrices);
  }


  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.localTransportPricesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocalTransportPriceDto: UpdateLocalTransportPriceDto
  ) {
    return this.localTransportPricesService.update(id, updateLocalTransportPriceDto);
  }

  @Patch('update/multiple')
  updateMultiple(
    @Body() updateLocalTransportPrices: UpdateLocalTransportPriceDto[]
  ) {
    return this.localTransportPricesService.updateMultiple(updateLocalTransportPrices);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.remove(id);
  }
}
