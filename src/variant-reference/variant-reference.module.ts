import { Module } from '@nestjs/common';
import { VariantReferenceService } from './variant-reference.service';
import { VariantReferenceController } from './variant-reference.controller';

@Module({
  controllers: [VariantReferenceController],
  providers: [VariantReferenceService],
})
export class VariantReferenceModule {}
