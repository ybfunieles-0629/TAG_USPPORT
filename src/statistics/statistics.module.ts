import { Module } from '@nestjs/common';

import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { SystemConfigsModule } from '../system-configs/system-configs.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ClientsModule,
    UsersModule,
    SystemConfigsModule,
    PurchaseOrderModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
