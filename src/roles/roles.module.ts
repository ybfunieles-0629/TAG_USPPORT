import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { PrivilegesModule } from '../privileges/privileges.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    PermissionsModule,
    PrivilegesModule,
    TypeOrmModule.forFeature([Role])
  ],
  exports: [TypeOrmModule, RolesService]
})
export class RolesModule {}
