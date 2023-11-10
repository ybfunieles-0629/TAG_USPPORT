import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniquePropertyDto } from './create-tag-sub-technique-property.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTagSubTechniquePropertyDto extends PartialType(CreateTagSubTechniquePropertyDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
