import { PartialType } from '@nestjs/swagger';
import { CreateOrderListDetailDto } from './create-order-list-detail.dto';

export class UpdateOrderListDetailDto extends PartialType(CreateOrderListDetailDto) {}
