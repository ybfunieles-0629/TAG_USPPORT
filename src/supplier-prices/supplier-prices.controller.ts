import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { SupplierPricesService } from './supplier-prices.service';
import { CreateSupplierPriceDto } from './dto/create-supplier-price.dto';
import { UpdateSupplierPriceDto } from './dto/update-supplier-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('supplier-prices')
export class SupplierPricesController {
  constructor(private readonly supplierPricesService: SupplierPricesService) { }

  @Post()
  create(
    @Body() createSupplierPriceDto: CreateSupplierPriceDto
  ) {
    return this.supplierPricesService.create(createSupplierPriceDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.supplierPricesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPricesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierPriceDto: UpdateSupplierPriceDto
  ) {
    return this.supplierPricesService.update(id, updateSupplierPriceDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPricesService.remove(id);
  }
}
