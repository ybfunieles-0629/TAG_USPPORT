import { PartialType } from '@nestjs/swagger';
import { CreateSupplierTypeDto } from './create-supplier-type.dto';

export class UpdateSupplierTypeDto extends PartialType(CreateSupplierTypeDto) {}
