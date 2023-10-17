import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DisccountsService } from './disccounts.service';
import { DisccountsController } from './disccounts.controller';
import { Disccounts } from './entities/disccounts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disccounts]),
  ],
  controllers: [DisccountsController],
  providers: [DisccountsService],
  exports: [TypeOrmModule, DisccountsService],
})
export class DisccountsModule {}