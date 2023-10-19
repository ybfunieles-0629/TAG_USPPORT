import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { Color } from './entities/color.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forFeature([Color])
  ],
  controllers: [ColorsController],
  providers: [ColorsService],
  exports: [TypeOrmModule, ColorsService]
})
export class ColorsModule {}
