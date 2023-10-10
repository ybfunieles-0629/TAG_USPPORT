import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { RefProductsService } from './ref-products.service';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('ref-products')
export class RefProductsController {
  constructor(private readonly refProductsService: RefProductsService) { }

  @Post()
  create(@Body() createRefProductDto: CreateRefProductDto) {
    return this.refProductsService.create(createRefProductDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.refProductsService.findAll(paginationDto);
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
