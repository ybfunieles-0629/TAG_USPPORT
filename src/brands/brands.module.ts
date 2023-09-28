import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from './entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand])
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [TypeOrmModule, BrandsService]
})
export class BrandsModule {}
