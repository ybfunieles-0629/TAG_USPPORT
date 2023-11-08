import { PartialType } from '@nestjs/swagger';
import { CreateCommercialQualificationDto } from './create-commercial-qualification.dto';

export class UpdateCommercialQualificationDto extends PartialType(CreateCommercialQualificationDto) {}
