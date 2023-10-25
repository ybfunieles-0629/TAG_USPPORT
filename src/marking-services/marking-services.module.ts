import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingServicesService } from './marking-services.service';
import { MarkingServicesController } from './marking-services.controller';
import { MarkingService } from './entities/marking-service.entity';
import { MarkingsModule } from '../markings/markings.module';
import { ExternalSubTechniquesModule } from '../external-sub-techniques/external-sub-techniques.module';
import { QuoteDetailsModule } from '../quote-details/quote-details.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';

@Module({
  imports: [
    ExternalSubTechniquesModule,
    MarkingsModule,
    MarkingServicePropertiesModule,
    QuoteDetailsModule,
    TypeOrmModule.forFeature([MarkingService]),
  ],
  controllers: [MarkingServicesController],
  providers: [MarkingServicesService],
  exports: [TypeOrmModule, MarkingServicesService]
})
export class MarkingServicesModule {}
