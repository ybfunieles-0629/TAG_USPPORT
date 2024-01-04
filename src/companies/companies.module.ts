import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Company])
  ],
  exports: [TypeOrmModule, CompaniesService]
})
export class CompaniesModule { }