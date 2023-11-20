import { PartialType } from '@nestjs/swagger';
import { CreateOrderRatingDto } from './create-order-rating.dto';

export class UpdateOrderRatingDto extends PartialType(CreateOrderRatingDto) {}
