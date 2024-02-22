import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePaymentInvoiceDto {
  @IsOptional()
  @IsInt()
  amount?: number;

  @IsOptional()
  @IsString()
  supplierPurchaseOrder?: string;
}