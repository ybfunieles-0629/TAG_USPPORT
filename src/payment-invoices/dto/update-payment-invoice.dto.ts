import { PartialType } from '@nestjs/swagger';
import { CreatePaymentInvoiceDto } from './create-payment-invoice.dto';

export class UpdatePaymentInvoiceDto extends PartialType(CreatePaymentInvoiceDto) {}
