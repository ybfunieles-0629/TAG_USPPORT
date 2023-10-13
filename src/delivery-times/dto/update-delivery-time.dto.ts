import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryTimeDto } from './create-delivery-time.dto';

export class UpdateDeliveryTimeDto extends PartialType(CreateDeliveryTimeDto) {}
