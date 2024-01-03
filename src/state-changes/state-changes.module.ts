import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { StateChangesService } from './state-changes.service';
import { StateChangesController } from './state-changes.controller';
import { StateChange } from './entities/state-change.entity';
import { SupplierPurchaseOrdersModule } from '../supplier-purchase-orders/supplier-purchase-orders.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupplierPurchaseOrdersModule,
    TypeOrmModule.forFeature([StateChange]),
  ],
  controllers: [StateChangesController],
  providers: [StateChangesService],
  exports: [TypeOrmModule, StateChangesService],
})
export class StateChangesModule {}
