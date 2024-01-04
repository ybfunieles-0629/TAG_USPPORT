import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Address])
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [TypeOrmModule, AddressesService],
})
export class AddressesModule {}
