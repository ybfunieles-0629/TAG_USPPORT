import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';
import { SubSupplierProductTypesController } from './sub-supplier-product-types.controller';
import { SubSupplierProductType } from './entities/sub-supplier-product-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubSupplierProductType])
  ],
  controllers: [SubSupplierProductTypesController],
  providers: [SubSupplierProductTypesService],
  exports: [TypeOrmModule, SubSupplierProductTypesService]
})
export class SubSupplierProductTypesModule {}
