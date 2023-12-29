import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from './entities/brand.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CompaniesModule,
    TypeOrmModule.forFeature([Brand])
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [TypeOrmModule, BrandsService]
})
export class BrandsModule {}
