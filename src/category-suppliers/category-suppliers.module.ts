import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategorySuppliersService } from './category-suppliers.service';
import { CategorySuppliersController } from './category-suppliers.controller';
import { CategorySupplier } from './entities/category-supplier.entity';
import { CategoryTagModule } from '../category-tag/category-tag.module';

@Module({
  imports: [
    CategoryTagModule,
    TypeOrmModule.forFeature([CategorySupplier])
  ],
  controllers: [CategorySuppliersController],
  providers: [CategorySuppliersService],
  exports: [TypeOrmModule, CategorySuppliersService]
})
export class CategorySuppliersModule {}
