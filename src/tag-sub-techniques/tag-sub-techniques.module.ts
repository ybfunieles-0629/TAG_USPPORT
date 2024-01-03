import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { TagSubTechniquesService } from './tag-sub-techniques.service';
import { TagSubTechniquesController } from './tag-sub-techniques.controller';
import { TagSubTechnique } from './entities/tag-sub-technique.entity';
import { MarkingTagServicesModule } from '../marking-tag-services/marking-tag-services.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MarkingTagServicesModule,
    TypeOrmModule.forFeature([TagSubTechnique]),
  ],
  controllers: [TagSubTechniquesController],
  providers: [TagSubTechniquesService],
  exports: [TypeOrmModule, TagSubTechniquesService],
})
export class TagSubTechniquesModule {}
