import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';
import { SubSupplierProductTypesModule } from '../sub-supplier-product-types/sub-supplier-product-types.module';
import { UsersModule } from '../users/users.module';
import { EmailSenderModule } from '../email-sender/email-sender.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailSenderModule,
    SubSupplierProductTypesModule,
    UsersModule,
    TypeOrmModule.forFeature([Supplier])
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [TypeOrmModule, SuppliersService],
})
export class SuppliersModule {}
