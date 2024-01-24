import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { QuoteDetailsService } from './quote-details.service';
import { QuoteDetailsController } from './quote-details.controller';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuotesModule } from '../cart-quotes/cart-quotes.module';
import { ProductsModule } from '../products/products.module';
import { MarkingServicesModule } from '../marking-services/marking-services.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';
import { SystemConfigsModule } from '../system-configs/system-configs.module';
import { LocalTransportPricesModule } from '../local-transport-prices/local-transport-prices.module';
import { BrandsModule } from '../brands/brands.module';
import { ClientsModule } from '../clients/clients.module';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => BrandsModule),
    forwardRef(() => CartQuotesModule),
    // CategorySupplier,
    forwardRef(() => ClientsModule),
    forwardRef(() => LocalTransportPricesModule),
    MarkingServicesModule,
    MarkingServicePropertiesModule,
    forwardRef(() => ProductsModule),
    SystemConfigsModule,
    TypeOrmModule.forFeature([QuoteDetail]),
  ],
  controllers: [QuoteDetailsController],
  providers: [QuoteDetailsService],
  exports: [TypeOrmModule, QuoteDetailsService],
})
export class QuoteDetailsModule {}
