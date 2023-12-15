import { PartialType } from '@nestjs/swagger';
import { CreateCartQuoteDto } from './create-cart-quote.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCartQuoteDto extends PartialType(CreateCartQuoteDto) {
  @IsOptional()
  @IsString()
  epaycoCode?: string;
}