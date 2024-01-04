import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { MarkingTagServicesService } from './marking-tag-services.service';
import { MarkingTagServicesController } from './marking-tag-services.controller';
import { MarkingTagService } from './entities/marking-tag-service.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([MarkingTagService])
  ],
  controllers: [MarkingTagServicesController],
  providers: [MarkingTagServicesService],
  exports: [TypeOrmModule, MarkingTagServicesService]
})
export class MarkingTagServicesModule {}
