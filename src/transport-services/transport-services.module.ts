import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { TransportServicesService } from './transport-services.service';
import { TransportServicesController } from './transport-services.controller';
import { TransportService } from './entities/transport-service.entity';
import { QuoteDetailsModule } from '../quote-details/quote-details.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CompaniesModule,
    QuoteDetailsModule,
    TypeOrmModule.forFeature([TransportService])
  ],
  controllers: [TransportServicesController],
  providers: [TransportServicesService],
  exports: [TypeOrmModule, TransportServicesService],
})
export class TransportServicesModule {}