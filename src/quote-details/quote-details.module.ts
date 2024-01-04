import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { QuoteDetailsService } from './quote-details.service';
import { QuoteDetailsController } from './quote-details.controller';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuotesModule } from '../cart-quotes/cart-quotes.module';
import { ProductsModule } from '../products/products.module';
import { MarkingServicesModule } from '../marking-services/marking-services.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CartQuotesModule,
    MarkingServicesModule,
    ProductsModule,
    TypeOrmModule.forFeature([QuoteDetail]),
  ],
  controllers: [QuoteDetailsController],
  providers: [QuoteDetailsService],
  exports: [TypeOrmModule, QuoteDetailsService],
})
export class QuoteDetailsModule {}
