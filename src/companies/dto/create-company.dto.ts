import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  webUrl: string;

  @IsString()
  legalCapacity: string;

  @IsString()
  nit: string;

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
  // @IsString()
  // dniRepresentativeDocument: string;

  // @IsString()
  // commerceChamberDocument: string;
  
  // @IsString()
  // rutCompanyDocument: string;

  @IsEmail()
  billingEmail: string;

  @IsString()
  companyType: string;

  @IsString()
  documentType: string;
  
  @IsOptional()
  // @IsBoolean()
  ivaResponsable?: boolean = false;

  @IsOptional()
  // @IsBoolean()
  taxPayer?: boolean = false;

  @IsOptional()
  // @IsBoolean()
  selfRetaining?: boolean = false;
}