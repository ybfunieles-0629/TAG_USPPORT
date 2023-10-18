import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

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

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
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

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.listPricesService.remove(id);
  }
}
