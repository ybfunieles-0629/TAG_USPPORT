import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniqueDto } from './create-tag-sub-technique.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateTagSubTechniqueDto extends PartialType(CreateTagSubTechniqueDto) {
  @IsString()
  @IsUUID()
  id: string;
}
