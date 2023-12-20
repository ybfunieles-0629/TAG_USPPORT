import { PartialType } from '@nestjs/swagger';
import { CreateCartQuoteDto } from './create-cart-quote.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCartQuoteDto extends PartialType(CreateCartQuoteDto) {
  @IsOptional()
  @IsString()
  epaycoCode?: string;

  //* ---------- PURCHASE ORDER DATA ---------- */
  @IsOptional()
  @IsUUID()
  commercialUser?: string;

  @IsOptional()
  @IsUUID()
  clientUser?: string;
}