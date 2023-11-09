import { PartialType } from '@nestjs/swagger';
import { CreateExternalSubTechniqueDto } from './create-external-sub-technique.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateExternalSubTechniqueDto extends PartialType(CreateExternalSubTechniqueDto) {
  @IsString()
  @IsUUID()
  id: string;
}
