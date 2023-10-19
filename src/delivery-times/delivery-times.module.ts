import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryTimesService } from './delivery-times.service';
import { DeliveryTimesController } from './delivery-times.controller';
import { DeliveryTime } from './entities/delivery-time.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryTime]),
  ],
  controllers: [DeliveryTimesController],
  providers: [DeliveryTimesService],
  exports: [TypeOrmModule, DeliveryTimesService]
})
export class DeliveryTimesModule { }
