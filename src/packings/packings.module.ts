import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PackingsService } from './packings.service';
import { PackingsController } from './packings.controller';
import { Packing } from './entities/packing.entity';
import { ProductsModule } from '../products/products.module';
import { RefProductsModule } from '../ref-products/ref-products.module';

@Module({
  imports: [
    ProductsModule,
    RefProductsModule,
    TypeOrmModule.forFeature([Packing])
  ],
  controllers: [PackingsController],
  providers: [PackingsService],
  exports: [TypeOrmModule, PackingsService]
})
export class PackingsModule {}
