import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PrivilegesModule } from '../privileges/privileges.module';
import { BrandsModule } from '../brands/brands.module';
import { EmailSenderModule } from '../email-sender/email-sender.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    BrandsModule,
    CompaniesModule,
    EmailSenderModule,
    RolesModule,
    PermissionsModule,
    PrivilegesModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
  ],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }
