import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { DisccountService } from './disccount.service';
import { DisccountController } from './disccount.controller';
import { Disccount } from './entities/disccount.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { DisccountsModule } from '../disccounts/disccounts.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DisccountsModule,
    SuppliersModule,
    TypeOrmModule.forFeature([Disccount])
  ],
  controllers: [DisccountController],
  providers: [DisccountService],
  exports: [TypeOrmModule, DisccountService],
})
export class DisccountModule {}
