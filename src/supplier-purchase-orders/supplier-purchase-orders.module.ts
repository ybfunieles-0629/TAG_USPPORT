import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SupplierPurchaseOrdersService } from './supplier-purchase-orders.service';
import { SupplierPurchaseOrdersController } from './supplier-purchase-orders.controller';
import { SupplierPurchaseOrder } from './entities/supplier-purchase-order.entity';
import { StatesModule } from '../states/states.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    StatesModule,
    TypeOrmModule.forFeature([SupplierPurchaseOrder]),
  ],
  controllers: [SupplierPurchaseOrdersController],
  providers: [SupplierPurchaseOrdersService],
  exports: [TypeOrmModule, SupplierPurchaseOrdersService],
})
export class SupplierPurchaseOrdersModule {}
