import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExternalSubTechniquesService } from './external-sub-techniques.service';
import { ExternalSubTechniquesController } from './external-sub-techniques.controller';
import { ExternalSubTechnique } from './entities/external-sub-technique.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { MarkingsModule } from '../markings/markings.module';

@Module({
  imports: [
    MarkingsModule,
    SuppliersModule,
    TypeOrmModule.forFeature([ExternalSubTechnique]),
  ],
  controllers: [ExternalSubTechniquesController],
  providers: [ExternalSubTechniquesService],
  exports: [TypeOrmModule, ExternalSubTechniquesService],
})
export class ExternalSubTechniquesModule {}
