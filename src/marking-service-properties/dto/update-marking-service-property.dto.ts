import { PartialType } from '@nestjs/swagger';
import { CreateMarkingServicePropertyDto } from './create-marking-service-property.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateMarkingServicePropertyDto extends PartialType(CreateMarkingServicePropertyDto) {
  @IsString()
  @IsUUID()
  id: string;
}
