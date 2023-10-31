import { PartialType } from '@nestjs/swagger';
import { CreateListPriceDto } from './create-list-price.dto';
import { IsString } from 'class-validator';

export class UpdateListPriceDto extends PartialType(CreateListPriceDto) {
  @IsString()
  id: string;
}
