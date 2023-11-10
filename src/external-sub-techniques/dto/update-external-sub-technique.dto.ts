import { PartialType } from '@nestjs/swagger';
import { CreateExternalSubTechniqueDto } from './create-external-sub-technique.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateExternalSubTechniqueDto extends PartialType(CreateExternalSubTechniqueDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
