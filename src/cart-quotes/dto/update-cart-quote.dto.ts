import { PartialType } from '@nestjs/swagger';
import { CreateCartQuoteDto } from './create-cart-quote.dto';

export class UpdateCartQuoteDto extends PartialType(CreateCartQuoteDto) {}
