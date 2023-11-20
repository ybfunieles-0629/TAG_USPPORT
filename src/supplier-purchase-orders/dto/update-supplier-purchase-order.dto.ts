import { PartialType } from '@nestjs/swagger';
import { CreateSupplierPurchaseOrderDto } from './create-supplier-purchase-order.dto';

export class UpdateSupplierPurchaseOrderDto extends PartialType(CreateSupplierPurchaseOrderDto) {}
