import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SupplierPricesService } from './supplier-prices.service';
import { SupplierPricesController } from './supplier-prices.controller';
import { SupplierPrice } from './entities/supplier-price.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ProductsModule } from '../products/products.module';
import { ListPricesModule } from '../list-prices/list-prices.module';
import { RefProductsModule } from 'src/ref-products/ref-products.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SuppliersModule,
    ProductsModule,
    ListPricesModule,
    RefProductsModule,
    TypeOrmModule.forFeature([SupplierPrice]),
  ],
  controllers: [SupplierPricesController],
  providers: [SupplierPricesService],
  exports: [TypeOrmModule, SupplierPricesService],
})
export class SupplierPricesModule {}
