import { PartialType } from '@nestjs/swagger';
import { CreateSystemConfigOfferDto } from './create-system-config-offer.dto';

export class UpdateSystemConfigOfferDto extends PartialType(CreateSystemConfigOfferDto) {}
