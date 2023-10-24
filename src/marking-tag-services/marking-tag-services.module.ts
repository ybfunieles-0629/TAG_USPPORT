import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingTagServicesService } from './marking-tag-services.service';
import { MarkingTagServicesController } from './marking-tag-services.controller';
import { MarkingTagService } from './entities/marking-tag-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkingTagService])
  ],
  controllers: [MarkingTagServicesController],
  providers: [MarkingTagServicesService],
  exports: [TypeOrmModule, MarkingTagServicesService]
})
export class MarkingTagServicesModule {}
