import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';
import { TagSubTechniquePropertiesController } from './tag-sub-technique-properties.controller';
import { TagSubTechniqueProperty } from './entities/tag-sub-technique-property.entity';
import { TagSubTechniquesModule } from '../tag-sub-techniques/tag-sub-techniques.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TagSubTechniquesModule,
    TypeOrmModule.forFeature([TagSubTechniqueProperty]),
  ],
  controllers: [TagSubTechniquePropertiesController],
  providers: [TagSubTechniquePropertiesService],
  exports: [TypeOrmModule, TagSubTechniquePropertiesService],
})
export class TagSubTechniquePropertiesModule {}
