import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryTimesService } from './delivery-times.service';
import { DeliveryTimesController } from './delivery-times.controller';
import { DeliveryTime } from './entities/delivery-time.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductsModule } from '../products/products.module';
import { RefProductsModule } from '../ref-products/ref-products.module';

@Module({
  imports: [
    SuppliersModule,
    ProductsModule,
    RefProductsModule,
    TypeOrmModule.forFeature([DeliveryTime]),
  ],
  controllers: [DeliveryTimesController],
  providers: [DeliveryTimesService],
  exports: [TypeOrmModule, DeliveryTimesService]
})
export class DeliveryTimesModule { }
