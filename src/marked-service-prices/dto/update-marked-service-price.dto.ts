import { PartialType } from '@nestjs/swagger';
import { CreateMarkedServicePriceDto } from './create-marked-service-price.dto';

export class UpdateMarkedServicePriceDto extends PartialType(CreateMarkedServicePriceDto) {}
