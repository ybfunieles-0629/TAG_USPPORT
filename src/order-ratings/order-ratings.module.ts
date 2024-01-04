import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { OrderRatingsService } from './order-ratings.service';
import { OrderRatingsController } from './order-ratings.controller';
import { OrderRating } from './entities/order-rating.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([OrderRating]),
  ],
  controllers: [OrderRatingsController],
  providers: [OrderRatingsService],
  exports: [TypeOrmModule, OrderRatingsService],
})
export class OrderRatingsModule {}
