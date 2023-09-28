import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';
import { SubSupplierProductTypesModule } from '../sub-supplier-product-types/sub-supplier-product-types.module';
import { SupplierTypesModule } from '../supplier-types/supplier-types.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SupplierTypesModule,
    SubSupplierProductTypesModule,
    UsersModule,
    TypeOrmModule.forFeature([Supplier])
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [TypeOrmModule, SuppliersService],
})
export class SuppliersModule {}
