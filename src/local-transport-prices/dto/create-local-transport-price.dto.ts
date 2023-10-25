import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLocalTransportPriceDto {
  @IsInt()
  isNational: number;

  @IsInt()
  maximumVolume: number;

  @IsInt()
  maximumWeight: number;

  @IsInt()
  price: number;

  @IsString()
  vehicleType: string;

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