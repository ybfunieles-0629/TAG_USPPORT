import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { MarkingServicePropertiesController } from './marking-service-properties.controller';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkingServiceProperty])
  ],
  controllers: [MarkingServicePropertiesController],
  providers: [MarkingServicePropertiesService],
  exports: [TypeOrmModule, MarkingServicePropertiesService],
})
export class MarkingServicePropertiesModule {}
