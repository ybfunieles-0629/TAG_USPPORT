import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniquePropertyDto } from './create-tag-sub-technique-property.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateTagSubTechniquePropertyDto extends PartialType(CreateTagSubTechniquePropertyDto) {
  @IsString()
  @IsUUID()
  id: string;
}
