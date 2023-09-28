import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './entities/admin.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Admin])
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [TypeOrmModule, AdminService]
})
export class AdminModule {}
