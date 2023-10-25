import { PartialType } from '@nestjs/swagger';
import { CreateQuoteDetailDto } from './create-quote-detail.dto';

export class UpdateQuoteDetailDto extends PartialType(CreateQuoteDetailDto) {}
