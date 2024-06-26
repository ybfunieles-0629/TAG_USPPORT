import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StatesModule } from '../states/states.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { ShippingGuidesModule } from '../shipping-guides/shipping-guides.module';
import { BrandsModule } from 'src/brands/brands.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsModule,
    UsersModule,
    StatesModule,
    ShippingGuidesModule,
    BrandsModule,
    TypeOrmModule.forFeature([PurchaseOrder]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [TypeOrmModule, PurchaseOrderService],
})
export class PurchaseOrderModule {}
