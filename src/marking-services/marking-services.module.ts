import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { MarkingServicesService } from './marking-services.service';
import { MarkingServicesController } from './marking-services.controller';
import { MarkingService } from './entities/marking-service.entity';
import { MarkingsModule } from '../markings/markings.module';
import { ExternalSubTechniquesModule } from '../external-sub-techniques/external-sub-techniques.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ExternalSubTechniquesModule,
    MarkingsModule,
    MarkingServicePropertiesModule,
    TypeOrmModule.forFeature([MarkingService]),
  ],
  controllers: [MarkingServicesController],
  providers: [MarkingServicesService],
  exports: [TypeOrmModule, MarkingServicesService]
})
export class MarkingServicesModule {}
