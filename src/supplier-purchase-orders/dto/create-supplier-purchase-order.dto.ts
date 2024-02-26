import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSupplierPurchaseOrderDto {
  @IsOptional()
  @IsString()
  cost: number;

  @IsString()
  state: string;

  @IsOptional()
  @IsInt()
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