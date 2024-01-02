import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SystemConfigOffersService } from './system-config-offers.service';
import { SystemConfigOffersController } from './system-config-offers.controller';
import { SystemConfigOffer } from './entities/system-config-offer.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfigOffer]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ProductsModule,
  ],
  controllers: [SystemConfigOffersController],
  providers: [SystemConfigOffersService],
  exports: [TypeOrmModule, SystemConfigOffersService]
})
export class SystemConfigOffersModule {}
