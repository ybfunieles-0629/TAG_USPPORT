import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';
import { CreateSupplierPurchaseOrderDto } from './dto/create-supplier-purchase-order.dto';
import { UpdateSupplierPurchaseOrderDto } from './dto/update-supplier-purchase-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('supplier-purchase-orders')
export class SupplierPurchaseOrdersController {
  constructor(private readonly supplierPurchaseOrdersService: SupplierPurchaseOrdersService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('tagPurchaseOrderDocument'))
  create(
    @Body() createSupplierPurchaseOrderDto: CreateSupplierPurchaseOrderDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.supplierPurchaseOrdersService.create(createSupplierPurchaseOrderDto, file, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.supplierPurchaseOrdersService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPurchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('tagPurchaseOrderDocument'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierPurchaseOrderDto: UpdateSupplierPurchaseOrderDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.supplierPurchaseOrdersService.update(id, updateSupplierPurchaseOrderDto, file, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.supplierPurchaseOrdersService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.supplierPurchaseOrdersService.remove(id);
  }
}
