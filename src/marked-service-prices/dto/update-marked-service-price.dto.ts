import { PartialType } from '@nestjs/swagger';
import { CreateMarkedServicePriceDto } from './create-marked-service-price.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateMarkedServicePriceDto extends PartialType(CreateMarkedServicePriceDto) {
  @IsString()
  @IsUUID()
  id: string;
}
