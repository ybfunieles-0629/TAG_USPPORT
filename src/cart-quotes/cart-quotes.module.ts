import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartQuotesService } from './cart-quotes.service';
import { CartQuotesController } from './cart-quotes.controller';
import { CartQuote } from './entities/cart-quote.entity';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { StatesModule } from '../states/states.module';
import { LocalTransportPricesModule } from '../local-transport-prices/local-transport-prices.module';
import { OrderListDetailsModule } from '../order-list-details/order-list-details.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { SupplierPurchaseOrdersModule } from '../supplier-purchase-orders/supplier-purchase-orders.module';
import { QuoteDetailsModule } from '../quote-details/quote-details.module';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BrandsModule,
    ClientsModule,
    PurchaseOrderModule,
    forwardRef(() => LocalTransportPricesModule),
    forwardRef(() => OrderListDetailsModule),
    forwardRef(() => QuoteDetailsModule),
    UsersModule,
    StatesModule,
    SupplierPurchaseOrdersModule,
    TypeOrmModule.forFeature([CartQuote])
  ],
  controllers: [CartQuotesController],
  providers: [CartQuotesService],
  exports: [TypeOrmModule, CartQuotesService],
})
export class CartQuotesModule {}
