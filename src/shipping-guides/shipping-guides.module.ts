import { Module } from '@nestjs/common';
import { ShippingGuidesService } from './shipping-guides.service';
import { ShippingGuidesController } from './shipping-guides.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingGuide } from './entities/shipping-guide.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingGuide]),
  ],
  controllers: [ShippingGuidesController],
  providers: [ShippingGuidesService],
  exports: [TypeOrmModule, ShippingGuidesService],
})
export class ShippingGuidesModule {}
