import { Module } from '@nestjs/common';

import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { SystemConfigsModule } from '../system-configs/system-configs.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { OrderRatingsModule } from '../order-ratings/order-ratings.module';
import { CommercialQualificationModule } from '../commercial-qualification/commercial-qualification.module';

@Module({
  imports: [
    ClientsModule,
    CategorySuppliersModule,
    CommercialQualificationModule,
    UsersModule,
    SystemConfigsModule,
    OrderRatingsModule,
    PurchaseOrderModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
