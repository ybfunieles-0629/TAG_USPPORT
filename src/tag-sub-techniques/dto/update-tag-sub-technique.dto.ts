import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniqueDto } from './create-tag-sub-technique.dto';

export class UpdateTagSubTechniqueDto extends PartialType(CreateTagSubTechniqueDto) {}
