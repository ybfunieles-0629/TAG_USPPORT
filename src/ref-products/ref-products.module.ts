import { Module } from '@nestjs/common';
import { RefProductsService } from './ref-products.service';
import { RefProductsController } from './ref-products.controller';

@Module({
  controllers: [RefProductsController],
  providers: [RefProductsService],
})
export class RefProductsModule {}
