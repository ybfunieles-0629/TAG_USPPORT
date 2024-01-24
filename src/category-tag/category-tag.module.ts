import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CategoryTagService } from './category-tag.service';
import { CategoryTagController } from './category-tag.controller';
import { CategoryTag } from './entities/category-tag.entity';
import { EmailSenderModule } from '../email-sender/email-sender.module';
import { RefProductsModule } from '../ref-products/ref-products.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailSenderModule,
    forwardRef(() => RefProductsModule),
    TypeOrmModule.forFeature([CategoryTag])
  ],
  controllers: [CategoryTagController],
  providers: [CategoryTagService],
  exports: [TypeOrmModule, CategoryTagService]
})
export class CategoryTagModule { }
