import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { RefProductsService } from './ref-products.service';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterRefProductsDto } from './dto/filter-ref-products.dto';

@Controller('ref-products')
export class RefProductsController {
  constructor(private readonly refProductsService: RefProductsService) { }

  @Post()
  create(@Body() createRefProductDto: CreateRefProductDto) {
    return this.refProductsService.create(createRefProductDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.refProductsService.findAll(paginationDto);
  }

  @Post('filter')
  filterRefProducts(
    @Query() paginationDto: PaginationDto,
    @Body() filterRefProductsDto: FilterRefProductsDto
  ) {
    return this.refProductsService.filterProducts(filterRefProductsDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRefProductDto: UpdateRefProductDto
  ) {
    return this.refProductsService.update(id, updateRefProductDto);
  }

  @Patch('/allow/:id')
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.refProductsService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.refProductsService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.remove(id);
  }
}
