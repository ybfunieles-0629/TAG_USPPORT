import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';
import { CreateSupplierPurchaseOrderDto } from './dto/create-supplier-purchase-order.dto';
import { UpdateSupplierPurchaseOrderDto } from './dto/update-supplier-purchase-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('supplier-purchase-orders')
export class SupplierPurchaseOrdersController {
  constructor(private readonly supplierPurchaseOrdersService: SupplierPurchaseOrdersService) { }

  @Post()
  @UseInterceptors(FileInterceptor('tagPurchaseOrderDocument'))
  create(
    @Body() createSupplierPurchaseOrderDto: CreateSupplierPurchaseOrderDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.supplierPurchaseOrdersService.create(createSupplierPurchaseOrderDto, file);
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
  @UseInterceptors(FileInterceptor('tagPurchaseOrderDocument'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierPurchaseOrderDto: UpdateSupplierPurchaseOrderDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.supplierPurchaseOrdersService.update(id, updateSupplierPurchaseOrderDto, file);
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
