import { PartialType } from '@nestjs/swagger';
import { CreateShippingGuideDto } from './create-shipping-guide.dto';

export class UpdateShippingGuideDto extends PartialType(CreateShippingGuideDto) {}
