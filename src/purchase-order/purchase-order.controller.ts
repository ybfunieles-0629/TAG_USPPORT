import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) { }

  @Post()
  create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto
  ) {
    return this.purchaseOrderService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.purchaseOrderService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.purchaseOrderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ) {
    return this.purchaseOrderService.update(id, updatePurchaseOrderDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.purchaseOrderService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.purchaseOrderService.remove(id);
  }
}
