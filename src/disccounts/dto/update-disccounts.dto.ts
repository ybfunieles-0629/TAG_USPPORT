import { PartialType } from '@nestjs/swagger';
import { CreateDisccountsDto } from './create-disccounts.dto';
import { IsString } from 'class-validator';

export class UpdateDisccountsDto extends PartialType(CreateDisccountsDto) {
  @IsString()
  id: string;
}