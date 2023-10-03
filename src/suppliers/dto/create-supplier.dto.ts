import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  adminType: string;

  @IsString()
  supplierDesc: string;

  @IsString()
  pickupAddress: string;

  @IsNumber()
  profitMargin: number;

  @IsNumber()
  hasApi: number;

  @IsNumber()
  paymentDeadline: number;

  @IsNumber()
  advancePercentage: number;

  @IsOptional()
  bills?: boolean;

  @IsNumber()
  scheduledDaysToUpdate: number;

  @IsString()
  supplierType: string;

  @IsString()
  bankAccountType: string;
  
  @IsString()
  bankAccountNumber: string;

  @IsString()
  bankAccount: string;

  // @IsString()
  // portfolio: string;

  @IsString()
  user: string;
  

  @IsString()
  @IsOptional()
  subSupplierProductType: string;
}
