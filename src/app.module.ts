import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrivilegesModule } from './privileges/privileges.module';
import { CommonModule } from './common/common.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductsModule } from './products/products.module';
import { ImagesModule } from './images/images.module';
import { CategoriesModule } from './categories/categories.module';
import { PricesModule } from './prices/prices.module';
import { AddressesModule } from './addresses/addresses.module';
import { BrandsModule } from './brands/brands.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { AdminModule } from './admin/admin.module';
import { SupplierTypesModule } from './supplier-types/supplier-types.module';
import { SubSupplierProductTypesModule } from './sub-supplier-product-types/sub-supplier-product-types.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod' ? true : false,
      extra: {
        ssl: process.env.STAGE === 'prod'
          ? { rejectUnauthorized: false }
          : null,
      },
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true
    }),
    ClientsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PrivilegesModule,
    CommonModule,
    CompaniesModule,
    ProductsModule,
    ImagesModule,
    CategoriesModule,
    PricesModule,
    AddressesModule,
    BrandsModule,
    SuppliersModule,
    AdminModule,
    SupplierTypesModule,
    SubSupplierProductTypesModule,
  ],
})
export class AppModule { }
