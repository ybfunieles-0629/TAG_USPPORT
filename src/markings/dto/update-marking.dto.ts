import { PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateMarkingDto } from './create-marking.dto';

export class UpdateMarkingDto extends PartialType(CreateMarkingDto) {
  @IsString()
  id: string;
}
