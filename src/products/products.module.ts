import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { VariantReferenceModule } from '../variant-reference/variant-reference.module';
import { ColorsModule } from '../colors/colors.module';
import { RefProductsModule } from '../ref-products/ref-products.module';
import { CategorySuppliersModule } from '../category-suppliers/category-suppliers.module';
import { ImagesModule } from '../images/images.module';
import { UsersModule } from '../users/users.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';
import { EmailSenderModule } from '../email-sender/email-sender.module';
import { SystemConfigsModule } from '../system-configs/system-configs.module';
import { LocalTransportPricesModule } from '../local-transport-prices/local-transport-prices.module';
import { DisccountModule } from '../disccount/disccount.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),    EmailSenderModule,
    CategorySuppliersModule,
    ColorsModule,
    DisccountModule,
    ImagesModule,
    SystemConfigsModule,
    LocalTransportPricesModule,
    MarkingServicePropertiesModule,
    RefProductsModule,
    UsersModule,
    VariantReferenceModule,
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService]
})
export class ProductsModule {}
