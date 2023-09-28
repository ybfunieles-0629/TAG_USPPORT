import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { AddressesModule } from '../addresses/addresses.module';
import { BrandsModule } from '../brands/brands.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [
    AddressesModule,
    BrandsModule,
    UsersModule,
    TypeOrmModule.forFeature([Client])
  ],
  exports: [TypeOrmModule, ClientsService]
})
export class ClientsModule {}
