import { PartialType } from '@nestjs/swagger';
import { CreateTagSubTechniquePropertyDto } from './create-tag-sub-technique-property.dto';

export class UpdateTagSubTechniquePropertyDto extends PartialType(CreateTagSubTechniquePropertyDto) {}
