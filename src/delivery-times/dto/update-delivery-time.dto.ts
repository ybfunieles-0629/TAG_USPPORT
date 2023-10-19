import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryTimeDto } from './create-delivery-time.dto';
import { IsString } from 'class-validator';

export class UpdateDeliveryTimeDto extends PartialType(CreateDeliveryTimeDto) {
  @IsString()
  id: string;
}