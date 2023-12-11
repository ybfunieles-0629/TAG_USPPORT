import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSystemConfigDto {
  @IsInt()
  generalDeliveryTime: number;

  @IsInt()
  noCorporativeClientsMargin: number;

  @IsInt()
  importationFee: number;

  @IsInt()
  withholdingAtSource: number;

  @IsInt()
  supplierFinancingPercentage: number;

  @IsInt()
  marginForDialingServices: number;

  @IsInt()
  marginForTransportServices: number;

  @IsInt()
  maxDiscount: number;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}