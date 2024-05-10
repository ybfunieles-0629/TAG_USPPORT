import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {

  
  @IsString()
  clientId: string;
  
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsString()
  postalCode: string;

  @IsString()
  gpsLocation: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  mainAddress: string;

  @IsNumber()
  isPrimary: number;

}
