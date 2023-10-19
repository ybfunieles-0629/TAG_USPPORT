import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefProductsService } from './ref-products.service';
import { RefProductsController } from './ref-products.controller';
import { RefProduct } from './entities/ref-product.entity';
import { MarkingsModule } from '../markings/markings.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { UsersModule } from '../users/users.module';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    CategorySuppliersModule,
    SuppliersModule,
    MarkingsModule,
    ProductsModule,
    UsersModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([RefProduct]),
  ],
  controllers: [RefProductsController],
  providers: [RefProductsService],
  exports: [TypeOrmModule, RefProductsService]
})
export class RefProductsModule {}