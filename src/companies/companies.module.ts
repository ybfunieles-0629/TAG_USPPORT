import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [
    AddressesModule,
    TypeOrmModule.forFeature([Company])
  ],
  exports: [TypeOrmModule, CompaniesService]
})
export class CompaniesModule { }