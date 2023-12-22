import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderListDetailsService } from './order-list-details.service';
import { OrderListDetailsController } from './order-list-details.controller';
import { OrderListDetail } from './entities/order-list-detail.entity';
import { OrderRatingsModule } from '../order-ratings/order-ratings.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { MarkingServicesModule } from '../marking-services/marking-services.module';
import { TransportServicesModule } from '../transport-services/transport-services.module';
import { StatesModule } from '../states/states.module';
import { ProductsModule } from '../products/products.module';
import { SupplierPurchaseOrdersModule } from '../supplier-purchase-orders/supplier-purchase-orders.module';

@Module({
  imports: [
    MarkingServicesModule,
    OrderRatingsModule,
    PurchaseOrderModule,
    ProductsModule,
    StatesModule,
    SupplierPurchaseOrdersModule,
    forwardRef(() => TransportServicesModule),
    TypeOrmModule.forFeature([OrderListDetail])
  ],
  controllers: [OrderListDetailsController],
  providers: [OrderListDetailsService],
  exports: [TypeOrmModule, OrderListDetailsService],
})
export class OrderListDetailsModule {}
