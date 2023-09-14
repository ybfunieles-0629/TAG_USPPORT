import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

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
  dniRepresentativeDocument: string;

  @IsString()
  commerceChamberDocument: string;
  
  @IsString()
  rutCompanyDocument: string;

  @IsEmail()
  billingEmail: string;

  @IsString()
  companyType: string;

  @IsString()
  documentType: string;

  @IsString()
  deliveryAddress: string;

  @IsBoolean()
  ivaResponsable?: boolean;

  @IsBoolean()
  taxPayer?: boolean;

  @IsBoolean()
  selfRetaining?: boolean;
}