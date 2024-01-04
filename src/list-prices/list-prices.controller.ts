import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ListPricesService } from './list-prices.service';
import { CreateListPriceDto } from './dto/create-list-price.dto';
import { UpdateListPriceDto } from './dto/update-list-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('list-prices')
export class ListPricesController {
  constructor(private readonly listPricesService: ListPricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createListPriceDto: CreateListPriceDto) {
    return this.listPricesService.create(createListPriceDto);
  }

  @Post('/create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createListPrices: CreateListPriceDto[]
  ) {
    return this.listPricesService.createMultiple(createListPrices);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.listPricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.listPricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateListPriceDto: UpdateListPriceDto
  ) {
    return this.listPricesService.update(id, updateListPriceDto);
  }

  @Patch('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateListPrices: UpdateListPriceDto[]
  ) {
    return this.listPricesService.updateMultiple(updateListPrices);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.listPricesService.remove(id);
  }
}
