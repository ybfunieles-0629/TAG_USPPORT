import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LocalTransportPricesService } from './local-transport-prices.service';
import { CreateLocalTransportPriceDto } from './dto/create-local-transport-price.dto';
import { UpdateLocalTransportPriceDto } from './dto/update-local-transport-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('local-transport-prices')
export class LocalTransportPricesController {
  constructor(private readonly localTransportPricesService: LocalTransportPricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createLocalTransportPriceDto: CreateLocalTransportPriceDto) {
    return this.localTransportPricesService.create(createLocalTransportPriceDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createLocalTransportPrices: CreateLocalTransportPriceDto[]
  ) {
    return this.localTransportPricesService.createMultiple(createLocalTransportPrices);
  }


  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.localTransportPricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocalTransportPriceDto: UpdateLocalTransportPriceDto
  ) {
    return this.localTransportPricesService.update(id, updateLocalTransportPriceDto);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateLocalTransportPrices: UpdateLocalTransportPriceDto[]
  ) {
    return this.localTransportPricesService.updateMultiple(updateLocalTransportPrices);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.remove(id);
  }
}
