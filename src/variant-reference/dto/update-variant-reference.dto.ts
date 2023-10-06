import { PartialType } from '@nestjs/swagger';
import { CreateVariantReferenceDto } from './create-variant-reference.dto';

export class UpdateVariantReferenceDto extends PartialType(CreateVariantReferenceDto) {}
