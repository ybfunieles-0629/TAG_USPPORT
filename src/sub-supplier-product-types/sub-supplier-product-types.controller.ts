import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';
import { CreateSubSupplierProductTypeDto } from './dto/create-sub-supplier-product-type.dto';
import { UpdateSubSupplierProductTypeDto } from './dto/update-sub-supplier-product-type.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('sub-supplier-product-types')
export class SubSupplierProductTypesController {
  constructor(private readonly subSupplierProductTypesService: SubSupplierProductTypesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createSubSupplierProductTypeDto: CreateSubSupplierProductTypeDto) {
    return this.subSupplierProductTypesService.create(createSubSupplierProductTypeDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.subSupplierProductTypesService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(
    @Param('term') term: string
  ) {
    return this.subSupplierProductTypesService.findOne(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubSupplierProductTypeDto: UpdateSubSupplierProductTypeDto
  ) {
    return this.subSupplierProductTypesService.update(id, updateSubSupplierProductTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.subSupplierProductTypesService.remove(id);
  }
}
