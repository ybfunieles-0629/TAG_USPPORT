import { Module } from '@nestjs/common';
import { CategorySuppliersService } from './category-suppliers.service';
import { CategorySuppliersController } from './category-suppliers.controller';

@Module({
  controllers: [CategorySuppliersController],
  providers: [CategorySuppliersService],
})
export class CategorySuppliersModule {}
