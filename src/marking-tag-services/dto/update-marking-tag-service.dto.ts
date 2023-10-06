import { PartialType } from '@nestjs/swagger';
import { CreateMarkingTagServiceDto } from './create-marking-tag-service.dto';

export class UpdateMarkingTagServiceDto extends PartialType(CreateMarkingTagServiceDto) {}
