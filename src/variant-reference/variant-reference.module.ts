import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { VariantReferenceService } from './variant-reference.service';
import { VariantReferenceController } from './variant-reference.controller';
import { VariantReference } from './entities/variant-reference.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([VariantReference])
  ],
  controllers: [VariantReferenceController],
  providers: [VariantReferenceService],
  exports: [TypeOrmModule, VariantReferenceService]
})
export class VariantReferenceModule {}
