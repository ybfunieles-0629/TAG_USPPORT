import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { AccessModule } from '../access/access.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    // AccessModule,
    CompaniesModule,
    RolesModule,
    TypeOrmModule.forFeature([User])
  ],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }
