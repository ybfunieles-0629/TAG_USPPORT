import { Module } from '@nestjs/common';
import { MarkedServicePricesService } from './marked-service-prices.service';
import { MarkedServicePricesController } from './marked-service-prices.controller';

@Module({
  controllers: [MarkedServicePricesController],
  providers: [MarkedServicePricesService],
})
export class MarkedServicePricesModule {}
