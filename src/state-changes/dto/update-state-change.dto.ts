import { PartialType } from '@nestjs/swagger';
import { CreateStateChangeDto } from './create-state-change.dto';

export class UpdateStateChangeDto extends PartialType(CreateStateChangeDto) {}
