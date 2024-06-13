import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateAddressDto {

  @IsOptional()
  @IsString()
  clientId: string;
  
  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  gpsLocation: string;

  @IsOptional()
  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  mainAddress: string;

  @IsOptional()
  @IsNumber()
  isPrimary: number;

}
