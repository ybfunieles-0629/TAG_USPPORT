import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ShippingGuidesService } from './shipping-guides.service';
import { ShippingGuidesController } from './shipping-guides.controller';
import { ShippingGuide } from './entities/shipping-guide.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([ShippingGuide]),
  ],
  controllers: [ShippingGuidesController],
  providers: [ShippingGuidesService],
  exports: [TypeOrmModule, ShippingGuidesService],
})
export class ShippingGuidesModule {}
