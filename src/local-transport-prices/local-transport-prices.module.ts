import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocalTransportPricesService } from './local-transport-prices.service';
import { LocalTransportPricesController } from './local-transport-prices.controller';
import { LocalTransportPrice } from './entities/local-transport-price.entity';
import { TransportServicesModule } from '../transport-services/transport-services.module';

@Module({
  imports: [
    TransportServicesModule,
    TypeOrmModule.forFeature([LocalTransportPrice])
  ],
  controllers: [LocalTransportPricesController],
  providers: [LocalTransportPricesService],
  exports: [TypeOrmModule, LocalTransportPricesService],
})
export class LocalTransportPricesModule {}
