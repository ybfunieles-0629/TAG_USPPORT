import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import { IsOptional } from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @IsOptional()
  id?: string;
}
