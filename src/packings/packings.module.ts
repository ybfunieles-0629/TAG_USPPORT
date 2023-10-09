import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PackingsService } from './packings.service';
import { PackingsController } from './packings.controller';
import { Packing } from './entities/packing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Packing])
  ],
  controllers: [PackingsController],
  providers: [PackingsService],
  exports: [TypeOrmModule, PackingsService]
})
export class PackingsModule {}
