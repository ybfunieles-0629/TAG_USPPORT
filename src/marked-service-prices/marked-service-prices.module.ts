import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkedServicePricesService } from './marked-service-prices.service';
import { MarkedServicePricesController } from './marked-service-prices.controller';
import { MarkedServicePrice } from './entities/marked-service-price.entity';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';

@Module({
  imports: [
    MarkingServicePropertiesModule,
    TypeOrmModule.forFeature([MarkedServicePrice])
  ],
  controllers: [MarkedServicePricesController],
  providers: [MarkedServicePricesService],
  exports: [TypeOrmModule, MarkedServicePricesService],
})
export class MarkedServicePricesModule {}
