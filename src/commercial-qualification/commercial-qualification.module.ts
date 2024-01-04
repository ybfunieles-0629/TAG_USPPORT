import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CommercialQualificationService } from './commercial-qualification.service';
import { CommercialQualificationController } from './commercial-qualification.controller';
import { CommercialQualification } from './entities/commercial-qualification.entity';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PurchaseOrderModule,
    TypeOrmModule.forFeature([CommercialQualification]),
  ],
  controllers: [CommercialQualificationController],
  providers: [CommercialQualificationService],
  exports: [TypeOrmModule, CommercialQualificationService],
})
export class CommercialQualificationModule {}
