import { PartialType } from '@nestjs/swagger';
import { CreateMarkingServicePropertyDto } from './create-marking-service-property.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMarkingServicePropertyDto extends PartialType(CreateMarkingServicePropertyDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
