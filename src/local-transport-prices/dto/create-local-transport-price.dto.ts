import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLocalTransportPriceDto {
  @IsInt()
  maximumWeight: number;

  @IsInt()
  maximumHeight: number;

  @IsInt()
  maximumWidth: number;

  @IsInt()
  maximumLarge: number;

  @IsInt()
  price: number;

  @IsString()
  vehicleType: string;

  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsString()
  transportService: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}