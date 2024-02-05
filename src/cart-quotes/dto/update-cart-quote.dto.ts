import { PartialType } from '@nestjs/swagger';
import { CreateCartQuoteDto } from './create-cart-quote.dto';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCartQuoteDto extends PartialType(CreateCartQuoteDto) {
  @IsOptional()
  @IsUUID()
  commercialUser?: string;

  @IsOptional()
  @IsBoolean()
  generateOrder?: boolean;
}