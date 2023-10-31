import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { ListPricesService } from './list-prices.service';
import { CreateListPriceDto } from './dto/create-list-price.dto';
import { UpdateListPriceDto } from './dto/update-list-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('list-prices')
export class ListPricesController {
  constructor(private readonly listPricesService: ListPricesService) { }

  @Post()
  create(@Body() createListPriceDto: CreateListPriceDto) {
    return this.listPricesService.create(createListPriceDto);
  }

  @Post('/create/multiple')
  createMultiple(
    @Body() createListPrices: CreateListPriceDto[]
  ) {
    return this.listPricesService.createMultiple(createListPrices);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.listPricesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.listPricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateListPriceDto: UpdateListPriceDto
  ) {
    return this.listPricesService.update(id, updateListPriceDto);
  }

  @Patch('/update/multiple')
  updateMultiple(
    @Body() updateListPrices: UpdateListPriceDto[]
  ) {
    return this.listPricesService.updateMultiple(updateListPrices);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.listPricesService.remove(id);
  }
}
