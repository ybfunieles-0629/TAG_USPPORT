import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';
import { ColorsModule } from '../colors/colors.module';

@Module({
  imports: [
    ColorsModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService]
})
export class ProductsModule {}
