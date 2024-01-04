import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { TagDisccountPricesService } from './tag-disccount-prices.service';
import { TagDisccountPricesController } from './tag-disccount-prices.controller';
import { TagDisccountPrice } from './entities/tag-disccount-price.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([TagDisccountPrice]),
  ],
  controllers: [TagDisccountPricesController],
  providers: [TagDisccountPricesService],
  exports: [TypeOrmModule, TagDisccountPricesService]
})
export class TagDisccountPricesModule {}