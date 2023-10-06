import { Module } from '@nestjs/common';
import { PackingsService } from './packings.service';
import { PackingsController } from './packings.controller';

@Module({
  controllers: [PackingsController],
  providers: [PackingsService],
})
export class PackingsModule {}
