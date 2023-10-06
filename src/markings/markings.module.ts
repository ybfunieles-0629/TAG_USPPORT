import { Module } from '@nestjs/common';
import { MarkingsService } from './markings.service';
import { MarkingsController } from './markings.controller';

@Module({
  controllers: [MarkingsController],
  providers: [MarkingsService],
})
export class MarkingsModule {}
