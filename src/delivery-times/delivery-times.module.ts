import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { DeliveryTimesService } from './delivery-times.service';
import { DeliveryTimesController } from './delivery-times.controller';
import { DeliveryTime } from './entities/delivery-time.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([DeliveryTime]),
  ],
  controllers: [DeliveryTimesController],
  providers: [DeliveryTimesService],
  exports: [TypeOrmModule, DeliveryTimesService]
})
export class DeliveryTimesModule { }
