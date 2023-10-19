import { PartialType } from '@nestjs/swagger';
import { CreateVariantReferenceDto } from './create-variant-reference.dto';
import { IsString } from 'class-validator';

export class UpdateVariantReferenceDto extends PartialType(CreateVariantReferenceDto) {
  @IsString()
  id: string;
}
