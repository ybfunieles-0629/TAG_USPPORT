import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransportServicesService } from './transport-services.service';
import { TransportServicesController } from './transport-services.controller';
import { TransportService } from './entities/transport-service.entity';
import { QuoteDetailsModule } from '../quote-details/quote-details.module';

@Module({
  imports: [
    QuoteDetailsModule,
    TypeOrmModule.forFeature([TransportService])
  ],
  controllers: [TransportServicesController],
  providers: [TransportServicesService],
  exports: [TypeOrmModule, TransportServicesService],
})
export class TransportServicesModule {}
