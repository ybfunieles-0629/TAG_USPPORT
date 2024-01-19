import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Image } from './entities/image.entity';
import { RefProductsModule } from '../ref-products/ref-products.module';
import { TagSubTechniquePropertiesModule } from '../tag-sub-technique-properties/tag-sub-technique-properties.module';
import { MarkingServicePropertiesModule } from '../marking-service-properties/marking-service-properties.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MarkingServicePropertiesModule,
    TagSubTechniquePropertiesModule,
    RefProductsModule,
    forwardRef(() =>ProductsModule),
    TypeOrmModule.forFeature([Image])
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [TypeOrmModule, ImagesService]
})
export class ImagesModule {}
