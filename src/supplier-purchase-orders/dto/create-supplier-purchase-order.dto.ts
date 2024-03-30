import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSupplierPurchaseOrderDto {
  @IsOptional()
  @IsString()
  cost?: number;

  @IsString()
  @IsOptional()
  orderCode?: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  amount?: number;
  
  @IsOptional()
  @IsInt()
  newBalance?: number;
  
  @IsOptional()
  @IsString()
  expirationDate?: string;
  
  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}