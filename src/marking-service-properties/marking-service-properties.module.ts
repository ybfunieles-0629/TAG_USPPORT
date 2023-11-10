import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { MarkingServicePropertiesController } from './marking-service-properties.controller';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { ExternalSubTechniquesModule } from '../external-sub-techniques/external-sub-techniques.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    ImagesModule,
    ExternalSubTechniquesModule,
    TypeOrmModule.forFeature([MarkingServiceProperty])
  ],
  controllers: [MarkingServicePropertiesController],
  providers: [MarkingServicePropertiesService],
  exports: [TypeOrmModule, MarkingServicePropertiesService],
})
export class MarkingServicePropertiesModule {}
