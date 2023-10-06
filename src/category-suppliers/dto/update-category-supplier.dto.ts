import { PartialType } from '@nestjs/swagger';
import { CreateCategorySupplierDto } from './create-category-supplier.dto';

export class UpdateCategorySupplierDto extends PartialType(CreateCategorySupplierDto) {}
