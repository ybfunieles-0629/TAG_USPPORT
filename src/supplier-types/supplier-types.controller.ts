import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { SupplierTypesService } from './supplier-types.service';
import { CreateSupplierTypeDto } from './dto/create-supplier-type.dto';
import { UpdateSupplierTypeDto } from './dto/update-supplier-type.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('supplier-types')
export class SupplierTypesController {
  constructor(private readonly supplierTypesService: SupplierTypesService) { }

  @Post()
  create(@Body() createSupplierTypeDto: CreateSupplierTypeDto) {
    return this.supplierTypesService.create(createSupplierTypeDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.supplierTypesService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.supplierTypesService.findOne(term);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierTypeDto: UpdateSupplierTypeDto
  ) {
    return this.supplierTypesService.update(id, updateSupplierTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierTypesService.remove(id);
  }
}
