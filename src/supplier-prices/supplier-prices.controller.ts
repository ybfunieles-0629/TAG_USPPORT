import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SupplierPricesService } from './supplier-prices.service';
import { CreateSupplierPriceDto } from './dto/create-supplier-price.dto';
import { UpdateSupplierPriceDto } from './dto/update-supplier-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('supplier-prices')
export class SupplierPricesController {
  constructor(private readonly supplierPricesService: SupplierPricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createSupplierPriceDto: CreateSupplierPriceDto
  ) {
    return this.supplierPricesService.create(createSupplierPriceDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.supplierPricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierPriceDto: UpdateSupplierPriceDto
  ) {
    return this.supplierPricesService.update(id, updateSupplierPriceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPricesService.remove(id);
  }
}
