import { PartialType } from '@nestjs/swagger';
import { CreateRefProductDto } from './create-ref-product.dto';

export class UpdateRefProductDto extends PartialType(CreateRefProductDto) {}
