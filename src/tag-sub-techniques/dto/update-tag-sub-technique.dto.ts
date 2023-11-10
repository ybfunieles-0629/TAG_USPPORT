import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniqueDto } from './create-tag-sub-technique.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTagSubTechniqueDto extends PartialType(CreateTagSubTechniqueDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
