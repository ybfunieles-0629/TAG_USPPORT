import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from './entities/brand.entity';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [
    AccessModule,
    TypeOrmModule.forFeature([Brand])
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
