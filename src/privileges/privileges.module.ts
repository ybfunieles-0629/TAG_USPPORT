import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { Privilege } from './entities/privilege.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Privilege])
  ],
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
  exports: [TypeOrmModule, PrivilegesService]
})
export class PrivilegesModule {}
