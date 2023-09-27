import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { Access } from './entities/access.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { ClientsModule } from '../clients/clients.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { PrivilegesModule } from '../privileges/privileges.module';

@Module({
  controllers: [AccessController],
  providers: [AccessService, JwtStrategy],
  imports: [
    UsersModule,
    CompaniesModule,
    RolesModule,
    ClientsModule,
    PermissionsModule,
    PrivilegesModule,
    TypeOrmModule.forFeature([Access]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AccessModule { }
