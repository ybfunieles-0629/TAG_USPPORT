import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';
import { CreateSubSupplierProductTypeDto } from './dto/create-sub-supplier-product-type.dto';
import { UpdateSubSupplierProductTypeDto } from './dto/update-sub-supplier-product-type.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('sub-supplier-product-types')
export class SubSupplierProductTypesController {
  constructor(private readonly subSupplierProductTypesService: SubSupplierProductTypesService) {}

  @Post()
  create(@Body() createSubSupplierProductTypeDto: CreateSubSupplierProductTypeDto) {
    return this.subSupplierProductTypesService.create(createSubSupplierProductTypeDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.subSupplierProductTypesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subSupplierProductTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubSupplierProductTypeDto: UpdateSubSupplierProductTypeDto) {
    return this.subSupplierProductTypesService.update(+id, updateSubSupplierProductTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subSupplierProductTypesService.remove(+id);
  }
}
