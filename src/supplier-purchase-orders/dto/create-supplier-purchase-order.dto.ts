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

  @IsString()
  @IsOptional()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  amount?: number;
  
  @IsOptional()
  @IsString()
  newBalance?: number;
  
  @IsOptional()
  @IsString()
  expirationDate?: string;
  
  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}