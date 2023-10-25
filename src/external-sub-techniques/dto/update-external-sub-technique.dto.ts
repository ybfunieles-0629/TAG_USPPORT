import { PartialType } from '@nestjs/swagger';
import { CreateExternalSubTechniqueDto } from './create-external-sub-technique.dto';

export class UpdateExternalSubTechniqueDto extends PartialType(CreateExternalSubTechniqueDto) {}
