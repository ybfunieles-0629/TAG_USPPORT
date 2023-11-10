import { PartialType } from '@nestjs/swagger';
import { CreateMarkedServicePriceDto } from './create-marked-service-price.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMarkedServicePriceDto extends PartialType(CreateMarkedServicePriceDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id: string;
}
