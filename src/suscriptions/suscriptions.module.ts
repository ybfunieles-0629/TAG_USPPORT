import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuscriptionsService } from './suscriptions.service';
import { SuscriptionsController } from './suscriptions.controller';
import { Suscription } from './entities/suscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suscription]),
  ],
  controllers: [SuscriptionsController],
  providers: [SuscriptionsService],
  exports: [TypeOrmModule, SuscriptionsService],
})
export class SuscriptionsModule {}
