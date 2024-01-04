import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { AddressesModule } from '../addresses/addresses.module';
import { BrandsModule } from '../brands/brands.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AddressesModule,
    BrandsModule,
    UsersModule,
    TypeOrmModule.forFeature([Client])
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [TypeOrmModule, ClientsService]
})
export class ClientsModule {}
