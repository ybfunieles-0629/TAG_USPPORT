import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuoteDetailDto {
  @IsString()
  quantities: string;

  @IsInt()
  totalPriceWithTransport: number;

  @IsInt()
  transportServiceTagClient: number;

  @IsInt()
  negotiationDiscount: number;

  @IsString()
  cartQuote: string;

  @IsString()
  product: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}