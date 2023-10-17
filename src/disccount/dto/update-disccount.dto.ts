import { PartialType } from '@nestjs/swagger';
import { CreateDisccountDto } from './create-disccount.dto';

export class UpdateDisccountDto extends PartialType(CreateDisccountDto) {}
