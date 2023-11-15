import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FinancingCostProfitsService } from './financing-cost-profits.service';
import { FinancingCostProfitsController } from './financing-cost-profits.controller';
import { SystemConfigsModule } from '../system-configs/system-configs.module';
import { FinancingCostProfit } from './entities/financing-cost-profit.entity';

@Module({
  imports: [
    SystemConfigsModule,
    TypeOrmModule.forFeature([FinancingCostProfit]),
  ],
  controllers: [FinancingCostProfitsController],
  providers: [FinancingCostProfitsService],
  exports: [TypeOrmModule, FinancingCostProfitsService],
})
export class FinancingCostProfitsModule {}
