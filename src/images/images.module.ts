import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Image } from './entities/image.entity';
import { RefProductsModule } from '../ref-products/ref-products.module';
import { TagSubTechniquePropertiesModule } from '../tag-sub-technique-properties/tag-sub-technique-properties.module';

@Module({
  imports: [
    TagSubTechniquePropertiesModule,
    RefProductsModule,
    TypeOrmModule.forFeature([Image])
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [TypeOrmModule, ImagesService]
})
export class ImagesModule {}
