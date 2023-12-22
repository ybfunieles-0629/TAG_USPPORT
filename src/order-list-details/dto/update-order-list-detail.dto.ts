import { PartialType } from '@nestjs/swagger';

import { CreateOrderListDetailDto } from './create-order-list-detail.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderListDetailDto extends PartialType(CreateOrderListDetailDto) {
  @IsOptional()
  @IsString()
  supplierPurchaseOrder?: string;
}