import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryTimesService } from './delivery-times.service';
import { DeliveryTimesController } from './delivery-times.controller';
import { DeliveryTime } from './entities/delivery-time.entity';
import { RefProductsModule } from 'src/ref-products/ref-products.module';

@Module({
  imports: [
    RefProductsModule,
    TypeOrmModule.forFeature([DeliveryTime]),
  ],
  controllers: [DeliveryTimesController],
  providers: [DeliveryTimesService],
  exports: [TypeOrmModule, DeliveryTimesService]
})
export class DeliveryTimesModule { }
