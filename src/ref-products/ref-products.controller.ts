import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RefProductsService } from './ref-products.service';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterRefProductsDto } from './dto/filter-ref-products.dto';

@Controller('ref-products')
export class RefProductsController {
  constructor(private readonly refProductsService: RefProductsService) { }

  @Post()
  @UseGuards(AuthGuard())
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

  @Get('is/allowed')
  @UseGuards(AuthGuard())
  filterReferencesByIsAllowed(
    @Query() paginationDto: PaginationDto
  ) {
    return this.refProductsService.filterReferencesByIsAllowed(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRefProductDto: UpdateRefProductDto
  ) {
    return this.refProductsService.update(id, updateRefProductDto);
  }

  @Patch('/allow/:id')
  @UseGuards(AuthGuard())
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.refProductsService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.refProductsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.remove(id);
  }
}
