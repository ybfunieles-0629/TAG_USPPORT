import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefProductsService } from './ref-products.service';
import { RefProductsController } from './ref-products.controller';
import { RefProduct } from './entities/ref-product.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { UsersModule } from '../users/users.module';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';
import { DeliveryTimesModule } from '../delivery-times/delivery-times.module';

@Module({
  imports: [
    CategorySuppliersModule,
    DeliveryTimesModule,
    SuppliersModule,
    MarkingServicePropertiesModule,
    UsersModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([RefProduct]),
  ],
  controllers: [RefProductsController],
  providers: [RefProductsService],
  exports: [TypeOrmModule, RefProductsService]
})
export class RefProductsModule {}