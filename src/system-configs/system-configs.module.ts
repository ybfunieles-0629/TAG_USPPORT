import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SystemConfigsService } from './system-configs.service';
import { SystemConfigsController } from './system-configs.controller';
import { SystemConfig } from './entities/system-config.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([SystemConfig])
  ],
  controllers: [SystemConfigsController],
  providers: [SystemConfigsService],
  exports: [TypeOrmModule, SystemConfigsService],
})
export class SystemConfigsModule {}
