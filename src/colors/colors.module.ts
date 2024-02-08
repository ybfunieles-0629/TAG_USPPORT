import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { Color } from './entities/color.entity';
import { RefProductsModule } from '../ref-products/ref-products.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Color]),
    forwardRef(() => RefProductsModule),
  ],
  controllers: [ColorsController],
  providers: [ColorsService],
  exports: [TypeOrmModule, ColorsService]
})
export class ColorsModule {}
