import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarkingsService } from './markings.service';
import { MarkingsController } from './markings.controller';
import { Marking } from './entities/marking.entity';
import { ProductsModule } from '../products/products.module';
import { MarkingTagServicesModule } from '../marking-tag-services/marking-tag-services.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    ProductsModule,
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
