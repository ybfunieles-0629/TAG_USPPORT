import { PartialType } from '@nestjs/swagger';
import { CreateSystemConfigBrandDto } from './create-system-config-brand.dto';

export class UpdateSystemConfigBrandDto extends PartialType(CreateSystemConfigBrandDto) {}
