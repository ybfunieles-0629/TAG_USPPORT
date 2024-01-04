import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { MarkingsService } from './markings.service';
import { MarkingsController } from './markings.controller';
import { Marking } from './entities/marking.entity';
import { MarkingTagServicesModule } from '../marking-tag-services/marking-tag-services.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MarkingsModule,
    MarkingTagServicesModule,
    CompaniesModule,
    TypeOrmModule.forFeature([Marking])
  ],
  controllers: [MarkingsController],
  providers: [MarkingsService],
  exports: [TypeOrmModule, MarkingsService]
})
export class MarkingsModule {}
