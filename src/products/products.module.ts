import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { RefProductsModule } from '../ref-products/ref-products.module';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';

@Module({
  imports: [
    RefProductsModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService]
})
export class ProductsModule {}
