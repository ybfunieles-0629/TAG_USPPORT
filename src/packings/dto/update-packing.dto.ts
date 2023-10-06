import { PartialType } from '@nestjs/swagger';
import { CreatePackingDto } from './create-packing.dto';

export class UpdatePackingDto extends PartialType(CreatePackingDto) {}
