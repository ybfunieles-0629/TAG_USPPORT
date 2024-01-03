import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { StatesService } from './states.service';
import { StatesController } from './states.controller';
import { State } from './entities/state.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([State]),
  ],
  controllers: [StatesController],
  providers: [StatesService],
  exports: [TypeOrmModule, StatesService],
})
export class StatesModule {}
