import { PartialType } from '@nestjs/swagger';
import { CreateMarkingDto } from './create-marking.dto';

export class UpdateMarkingDto extends PartialType(CreateMarkingDto) {}
