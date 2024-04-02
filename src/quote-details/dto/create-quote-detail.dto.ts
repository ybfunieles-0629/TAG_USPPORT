import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, isInt } from 'class-validator';

export class CreateQuoteDetailDto {
  @IsInt()
  quantities: number;

  @IsOptional()
  @IsInt()
  additionalDiscount?: number;

  @IsInt()
  unitPrice: number;

  @IsInt()
  @IsOptional()
  totalCostoProduccion: number;

  @IsInt()
  @IsOptional()
  totalCostoProduccionSinIva: number;
  

  @IsInt()
  @IsOptional()
  iva: number;

  @IsInt()
  @IsOptional()
  discount: number;

  @IsOptional()
  @IsInt()
  sampleTransportValue?: number;

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