import { PartialType } from '@nestjs/swagger';
import { CreateDiscountQuantityDto } from './create-discount-quantity.dto';

export class UpdateDiscountQuantityDto extends PartialType(CreateDiscountQuantityDto) {}
