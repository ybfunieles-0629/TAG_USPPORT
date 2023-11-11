import { PartialType } from '@nestjs/swagger';
import { CreateLocalTransportPriceDto } from './create-local-transport-price.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateLocalTransportPriceDto extends PartialType(CreateLocalTransportPriceDto) {
  @IsOptional()
  @IsString()
  @IsUUID()
  id?: string;
}