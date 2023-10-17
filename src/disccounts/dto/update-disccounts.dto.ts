import { PartialType } from '@nestjs/swagger';
import { CreateDisccountsDto } from './create-disccounts.dto';

export class UpdateDisccountsDto extends PartialType(CreateDisccountsDto) {}
