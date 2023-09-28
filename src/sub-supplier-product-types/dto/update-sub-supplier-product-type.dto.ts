import { PartialType } from '@nestjs/swagger';
import { CreateSubSupplierProductTypeDto } from './create-sub-supplier-product-type.dto';

export class UpdateSubSupplierProductTypeDto extends PartialType(CreateSubSupplierProductTypeDto) {}
