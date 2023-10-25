import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMarkingServiceDto {
  @IsString()
  mounting: string;

  @IsInt()
  calculatedMarkingPrice: number;

  @IsInt()
  markingTransportPrice: number;

  @IsString()
  marking: string;

  @IsString()
  markingServiceProperty: string;

  @IsString()
  externalSubTechnique: string;

  @IsString()
  quoteDetail: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}