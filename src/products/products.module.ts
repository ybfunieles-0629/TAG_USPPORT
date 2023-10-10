import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ColorsModule } from '../colors/colors.module';
import { MarketDesignAreaModule } from '../market-design-area/market-design-area.module';

@Module({
  imports: [
    ColorsModule,
    MarketDesignAreaModule,
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService]
})
export class ProductsModule {}
