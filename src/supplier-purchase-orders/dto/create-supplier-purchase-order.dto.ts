import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSupplierPurchaseOrderDto {
  @IsString()
  orderCode: string;

  @IsString()
  tagPurchaseOrderDocument: string;

  @IsInt()
  cost: number;

  @IsString()
  state: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}