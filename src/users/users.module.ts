import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrivilegesModule } from '../privileges/privileges.module';
import { BrandsModule } from '../brands/brands.module';
import { EmailSenderModule } from '../email-sender/email-sender.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    }),
    BrandsModule,
    CompaniesModule,
    EmailSenderModule,
    RolesModule,
    PermissionsModule,
    PrivilegesModule,
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule, UsersService]
})
export class UsersModule { }