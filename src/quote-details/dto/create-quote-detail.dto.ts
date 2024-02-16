import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuoteDetailDto {
  @IsInt()
  quantities: number;

  @IsInt()
  unitPrice: number;

  @IsInt()
  @IsOptional()
  iva: number;

  @IsInt()
  @IsOptional()
  discount: number;

  @IsInt()
  totalPriceWithTransport: number;

  @IsInt()
  transportServiceTagClient: number;

  @IsInt()
  negotiationDiscount: number;

  @IsString()
  cartQuote: string;

  @IsBoolean()
  hasSample: boolean;

  @IsOptional()
  @IsNumber()
  additionalDiscount?: number;

  @IsString()
  product: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  markingServices?: string[];
  
  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}