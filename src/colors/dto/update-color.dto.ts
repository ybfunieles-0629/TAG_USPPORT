import { PartialType } from '@nestjs/swagger';
import { CreateColorDto } from './create-color.dto';
import { IsString } from 'class-validator';

export class UpdateColorDto extends PartialType(CreateColorDto) {
  @IsString()
  id: string;
}