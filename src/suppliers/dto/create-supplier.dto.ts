import { IsNumber, IsOptional, IsString, isNumber } from 'class-validator';

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
  subSupplierProductType: string;
}
