import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  webUrl: string;

  @IsOptional()
  @IsString()
  legalCapacity: string;

  @IsOptional()
  @IsString()
  documentType: string;

  @IsString()
  nit: string;

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
  // @IsString()
  // dniRepresentativeDocument: string;

  // @IsString()
  // commerceChamberDocument: string;
  
  // @IsString()
  // rutCompanyDocument: string;

  @IsOptional()
  @IsEmail()
  billingEmail: string;

  @IsOptional()
  @IsString()
  companyType: string;
  
  @IsOptional()
  @IsString()
  ivaResponsable?: number;

  @IsOptional()
  @IsString()
  taxPayer?: number;

  @IsOptional()
  @IsString()
  selfRetaining?: number;
}