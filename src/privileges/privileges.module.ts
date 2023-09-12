import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { Privilege } from './entities/privilege.entity';

@Module({
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
  imports: [
    TypeOrmModule.forFeature([Privilege])
  ],
  exports: [TypeOrmModule, PrivilegesService]
})
export class PrivilegesModule {}
