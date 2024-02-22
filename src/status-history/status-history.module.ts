import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { StatusHistoryService } from './status-history.service';
import { StatusHistoryController } from './status-history.controller';
import { UsersModule } from '../users/users.module';
import { StatesModule } from '../states/states.module';
import { StatusHistory } from './entities/status-history.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([StatusHistory]),
    UsersModule,
    StatesModule,
  ],
  controllers: [StatusHistoryController],
  providers: [StatusHistoryService],
  exports: [TypeOrmModule, StatusHistoryService],
})
export class StatusHistoryModule {}
