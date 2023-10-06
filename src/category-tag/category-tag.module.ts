import { Module } from '@nestjs/common';
import { CategoryTagService } from './category-tag.service';
import { CategoryTagController } from './category-tag.controller';

@Module({
  controllers: [CategoryTagController],
  providers: [CategoryTagService],
})
export class CategoryTagModule {}
