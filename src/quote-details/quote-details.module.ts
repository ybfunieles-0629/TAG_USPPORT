import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuoteDetailsService } from './quote-details.service';
import { QuoteDetailsController } from './quote-details.controller';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuotesModule } from '../cart-quotes/cart-quotes.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    CartQuotesModule,
    ProductsModule,
    TypeOrmModule.forFeature([QuoteDetail]),
  ],
  controllers: [QuoteDetailsController],
  providers: [QuoteDetailsService],
  exports: [TypeOrmModule, QuoteDetailsService],
})
export class QuoteDetailsModule {}
