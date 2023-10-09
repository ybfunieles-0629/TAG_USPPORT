import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryTagService } from './category-tag.service';
import { CategoryTagController } from './category-tag.controller';
import { CategoryTag } from './entities/category-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryTag])
  ],
  controllers: [CategoryTagController],
  providers: [CategoryTagService],
  exports: [TypeOrmModule, CategoryTagService]
})
export class CategoryTagModule { }
