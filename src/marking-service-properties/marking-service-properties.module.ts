import { Module } from '@nestjs/common';
import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { MarkingServicePropertiesController } from './marking-service-properties.controller';

@Module({
  controllers: [MarkingServicePropertiesController],
  providers: [MarkingServicePropertiesService],
})
export class MarkingServicePropertiesModule {}
