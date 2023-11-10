import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateMarkingDto } from './create-marking.dto';

export class UpdateMarkingDto extends PartialType(CreateMarkingDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
