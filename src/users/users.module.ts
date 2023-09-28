import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { ClientsModule } from '../clients/clients.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PrivilegesModule } from '../privileges/privileges.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    CompaniesModule,
    RolesModule,
    PermissionsModule,
    PrivilegesModule,
    TypeOrmModule.forFeature([User])
  ],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }
