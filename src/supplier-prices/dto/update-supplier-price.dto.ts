import { PartialType } from '@nestjs/swagger';
import { CreateSupplierPriceDto } from './create-supplier-price.dto';

export class UpdateSupplierPriceDto extends PartialType(CreateSupplierPriceDto) {}
