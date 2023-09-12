import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    CompaniesModule,
    RolesModule,
    TypeOrmModule.forFeature([User])
  ],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }
