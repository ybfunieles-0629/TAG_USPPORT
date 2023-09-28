import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupplierTypesService } from './supplier-types.service';
import { SupplierTypesController } from './supplier-types.controller';
import { SupplierType } from './entities/supplier-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierType])
  ],
  controllers: [SupplierTypesController],
  providers: [SupplierTypesService],
  exports: [TypeOrmModule, SupplierTypesService]
})
export class SupplierTypesModule {}
