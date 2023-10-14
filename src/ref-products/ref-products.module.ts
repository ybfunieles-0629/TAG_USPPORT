import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefProductsService } from './ref-products.service';
import { RefProductsController } from './ref-products.controller';
import { RefProduct } from './entities/ref-product.entity';
import { MarkingsModule } from '../markings/markings.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { DeliveryTimesModule } from '../delivery-times/delivery-times.module';

@Module({
  imports: [
    CategorySuppliersModule,
    DeliveryTimesModule,
    SuppliersModule,
    MarkingsModule,
    TypeOrmModule.forFeature([RefProduct]),
  ],
  controllers: [RefProductsController],
  providers: [RefProductsService],
  exports: [TypeOrmModule, RefProductsService]
})
export class RefProductsModule {}