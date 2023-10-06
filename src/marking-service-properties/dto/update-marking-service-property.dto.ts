import { PartialType } from '@nestjs/swagger';
import { CreateMarkingServicePropertyDto } from './create-marking-service-property.dto';

export class UpdateMarkingServicePropertyDto extends PartialType(CreateMarkingServicePropertyDto) {}
