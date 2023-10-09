import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { CategorySuppliersService } from './category-suppliers.service';
import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('category-suppliers')
export class CategorySuppliersController {
  constructor(private readonly categorySuppliersService: CategorySuppliersService) { }

  @Post()
  create(@Body() createCategorySupplierDto: CreateCategorySupplierDto) {
    return this.categorySuppliersService.create(createCategorySupplierDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.categorySuppliersService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorySuppliersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategorySupplierDto: UpdateCategorySupplierDto
  ) {
    return this.categorySuppliersService.update(id, updateCategorySupplierDto);
  }

  @Patch(':id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categorySuppliersService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categorySuppliersService.remove(id);
  }
}
