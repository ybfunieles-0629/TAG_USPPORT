import { Module } from '@nestjs/common';

import { CartQuotesService } from './cart-quotes.service';
import { CartQuotesController } from './cart-quotes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartQuote } from './entities/cart-quote.entity';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ClientsModule,
    UsersModule,
    TypeOrmModule.forFeature([CartQuote])
  ],
  controllers: [CartQuotesController],
  providers: [CartQuotesService],
  exports: [TypeOrmModule, CartQuotesService],
})
export class CartQuotesModule {}
