import { PartialType } from '@nestjs/swagger';
import { CreateMarkingServiceDto } from './create-marking-service.dto';

export class UpdateMarkingServiceDto extends PartialType(CreateMarkingServiceDto) {}
