import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { MarkingServicePropertiesController } from './marking-service-properties.controller';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { ExternalSubTechniquesModule } from '../external-sub-techniques/external-sub-techniques.module';
import { TagSubTechniquePropertiesModule } from '../tag-sub-technique-properties/tag-sub-technique-properties.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ExternalSubTechniquesModule,
    TagSubTechniquePropertiesModule,
    TypeOrmModule.forFeature([MarkingServiceProperty])
  ],
  controllers: [MarkingServicePropertiesController],
  providers: [MarkingServicePropertiesService],
  exports: [TypeOrmModule, MarkingServicePropertiesService],
})
export class MarkingServicePropertiesModule {}
