import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkedServicePricesService } from './marked-service-prices.service';
import { MarkedServicePricesController } from './marked-service-prices.controller';
import { MarkedServicePrice } from './entities/marked-service-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkedServicePrice])
  ],
  controllers: [MarkedServicePricesController],
  providers: [MarkedServicePricesService],
  exports: [TypeOrmModule, MarkedServicePricesService],
})
export class MarkedServicePricesModule {}
