import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StatesModule } from '../states/states.module';

@Module({
  imports: [
    StatesModule,
    TypeOrmModule.forFeature([PurchaseOrder]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [TypeOrmModule, PurchaseOrderService],
})
export class PurchaseOrderModule {}
