import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategorySuppliersService } from './category-suppliers.service';
import { CategorySuppliersController } from './category-suppliers.controller';
import { CategorySupplier } from './entities/category-supplier.entity';
import { CategoryTagModule } from '../category-tag/category-tag.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    CategoryTagModule,
    SuppliersModule,
    UsersModule,
    TypeOrmModule.forFeature([CategorySupplier])
  ],
  controllers: [CategorySuppliersController],
  providers: [CategorySuppliersService],
  exports: [TypeOrmModule, CategorySuppliersService]
})
export class CategorySuppliersModule {}
