import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingsService } from './markings.service';
import { MarkingsController } from './markings.controller';
import { Marking } from './entities/marking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marking])
  ],
  controllers: [MarkingsController],
  providers: [MarkingsService],
  exports: [TypeOrmModule, MarkingsService]
})
export class MarkingsModule {}
