import { PartialType } from '@nestjs/swagger';
import { CreateListPriceDto } from './create-list-price.dto';

export class UpdateListPriceDto extends PartialType(CreateListPriceDto) {}
