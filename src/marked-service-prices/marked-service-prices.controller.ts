import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MarkedServicePricesService } from './marked-service-prices.service';
import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('marked-service-prices')
export class MarkedServicePricesController {
  constructor(private readonly markedServicePricesService: MarkedServicePricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    return this.markedServicePricesService.create(createMarkedServicePriceDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMarkedServicePrices: CreateMarkedServicePriceDto[]
  ) {
    return this.markedServicePricesService.createMultiple(createMarkedServicePrices);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markedServicePricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkedServicePriceDto: UpdateMarkedServicePriceDto
  ) {
    return this.markedServicePricesService.update(id, updateMarkedServicePriceDto);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMarkedServicePrices: UpdateMarkedServicePriceDto[]
  ) {
    return this.markedServicePricesService.updateMultiple(updateMarkedServicePrices);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markedServicePricesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.remove(id);
  }
}
