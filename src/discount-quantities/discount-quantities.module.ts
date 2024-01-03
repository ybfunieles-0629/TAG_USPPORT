import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { DiscountQuantitiesService } from './discount-quantities.service';
import { DiscountQuantitiesController } from './discount-quantities.controller';
import { DiscountQuantity } from './entities/discount-quantity.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([DiscountQuantity]),
  ],
  controllers: [DiscountQuantitiesController],
  providers: [DiscountQuantitiesService],
  exports: [TypeOrmModule, DiscountQuantitiesService],
})
export class DiscountQuantitiesModule {}
