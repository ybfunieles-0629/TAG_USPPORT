import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaymentInvoicesService } from './payment-invoices.service';
import { CreatePaymentInvoiceDto } from './dto/create-payment-invoice.dto';
import { UpdatePaymentInvoiceDto } from './dto/update-payment-invoice.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('payment-invoices')
export class PaymentInvoicesController {
  constructor(private readonly paymentInvoicesService: PaymentInvoicesService) { }

  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createPaymentInvoiceDto: CreatePaymentInvoiceDto,
    @GetUser() user: User,
  ) {
    return this.paymentInvoicesService.create(createPaymentInvoiceDto, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.paymentInvoicesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentInvoicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentInvoiceDto: UpdatePaymentInvoiceDto) {
    return this.paymentInvoicesService.update(+id, updatePaymentInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentInvoicesService.remove(+id);
  }
}
