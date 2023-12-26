import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

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
  @UseGuards(AuthGuard())
  findAll(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.purchaseOrderService.findAll(paginationDto, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.purchaseOrderService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('billingFile'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.purchaseOrderService.update(id, updatePurchaseOrderDto, file);
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
