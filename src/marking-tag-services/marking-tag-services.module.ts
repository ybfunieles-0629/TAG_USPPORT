import { Module } from '@nestjs/common';
import { MarkingTagServicesService } from './marking-tag-services.service';
import { MarkingTagServicesController } from './marking-tag-services.controller';

@Module({
  controllers: [MarkingTagServicesController],
  providers: [MarkingTagServicesService],
})
export class MarkingTagServicesModule {}
