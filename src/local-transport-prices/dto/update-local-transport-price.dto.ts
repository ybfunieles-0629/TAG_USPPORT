import { PartialType } from '@nestjs/swagger';
import { CreateLocalTransportPriceDto } from './create-local-transport-price.dto';

export class UpdateLocalTransportPriceDto extends PartialType(CreateLocalTransportPriceDto) {}
