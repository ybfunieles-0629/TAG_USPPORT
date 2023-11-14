import { IsArray, IsString, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  adminType: string;

  @IsString()
  supplierDesc: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  profitMargin: number;

  @IsString()
  hasApi: number;

  @IsString()
  paymentDeadline: number;

  @IsString()
  advancePercentage: number;

  @IsOptional()
  @IsString()
  bills: number;

  @IsString()
  scheduledDaysToUpdate: number;

  @IsOptional()
  @IsString()
  bankAccountType: string;
  
  @IsOptional()
  @IsString()
  bankAccountNumber: string;

  @IsOptional()
  @IsString()
  bankAccount: string;

  // @IsString()
  // portfolio: string;

  @IsString()
  user: string;
  
  @IsString()
  @IsOptional()
  subSupplierProductType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  refProducts: string[];
}
