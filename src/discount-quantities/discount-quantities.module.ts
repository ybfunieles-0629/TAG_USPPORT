import { Module } from '@nestjs/common';
import { DiscountQuantitiesService } from './discount-quantities.service';
import { DiscountQuantitiesController } from './discount-quantities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountQuantity } from './entities/discount-quantity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscountQuantity]),
  ],
  controllers: [DiscountQuantitiesController],
  providers: [DiscountQuantitiesService],
  exports: [TypeOrmModule, DiscountQuantitiesService],
})
export class DiscountQuantitiesModule {}
