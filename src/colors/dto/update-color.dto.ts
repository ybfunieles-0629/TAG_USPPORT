import { PartialType } from '@nestjs/swagger';
import { CreateColorDto } from './create-color.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateColorDto extends PartialType(CreateColorDto) {
  @IsString()
  @IsOptional()
  id: string;
}