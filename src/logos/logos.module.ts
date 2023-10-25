import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogosService } from './logos.service';
import { LogosController } from './logos.controller';
import { MarkingServicesModule } from '../marking-services/marking-services.module';
import { Logo } from './entities/logo.entity';

@Module({
  imports: [
    MarkingServicesModule,
    TypeOrmModule.forFeature([Logo]),
  ],
  controllers: [LogosController],
  providers: [LogosService],
  exports: [TypeOrmModule, LogosService],
})
export class LogosModule {}
