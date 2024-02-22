import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { PaymentInvoicesService } from './payment-invoices.service';
import { PaymentInvoicesController } from './payment-invoices.controller';
import { PaymentInvoice } from './entities/payment-invoice.entity';
import { SupplierPurchaseOrdersModule } from '../supplier-purchase-orders/supplier-purchase-orders.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([PaymentInvoice]),
    SupplierPurchaseOrdersModule,
  ],
  controllers: [PaymentInvoicesController],
  providers: [PaymentInvoicesService],
  exports: [TypeOrmModule, PaymentInvoicesModule]
})
export class PaymentInvoicesModule { }