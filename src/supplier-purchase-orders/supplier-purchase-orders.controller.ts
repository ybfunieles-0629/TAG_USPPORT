import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';
import { CreateSupplierPurchaseOrderDto } from './dto/create-supplier-purchase-order.dto';
import { UpdateSupplierPurchaseOrderDto } from './dto/update-supplier-purchase-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('supplier-purchase-orders')
export class SupplierPurchaseOrdersController {
  constructor(private readonly supplierPurchaseOrdersService: SupplierPurchaseOrdersService) { }

  @Post()
  create(@Body() createSupplierPurchaseOrderDto: CreateSupplierPurchaseOrderDto) {
    return this.supplierPurchaseOrdersService.create(createSupplierPurchaseOrderDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.supplierPurchaseOrdersService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPurchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierPurchaseOrderDto: UpdateSupplierPurchaseOrderDto
  ) {
    return this.supplierPurchaseOrdersService.update(id, updateSupplierPurchaseOrderDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.supplierPurchaseOrdersService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPurchaseOrdersService.remove(id);
  }
}
