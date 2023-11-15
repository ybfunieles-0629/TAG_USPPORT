import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';
import { ColorsModule } from '../colors/colors.module';
import { RefProductsModule } from '../ref-products/ref-products.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    CategorySuppliersModule,
    ColorsModule,
    ImagesModule,
    RefProductsModule,
    UsersModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService]
})
export class ProductsModule {}
