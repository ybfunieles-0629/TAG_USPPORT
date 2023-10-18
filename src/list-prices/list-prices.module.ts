import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListPricesService } from './list-prices.service';
import { ListPricesController } from './list-prices.controller';
import { ListPrice } from './entities/list-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListPrice])
  ],
  controllers: [ListPricesController],
  providers: [ListPricesService],
  exports: [TypeOrmModule, ListPricesService],
})
export class ListPricesModule {}
