import { PartialType } from '@nestjs/swagger';
import { CreateTagDisccountPriceDto } from './create-tag-disccount-price.dto';

export class UpdateTagDisccountPriceDto extends PartialType(CreateTagDisccountPriceDto) {}
