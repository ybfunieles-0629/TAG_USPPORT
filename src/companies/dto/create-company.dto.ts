import { IsBoolean, IsEmail, IsString } from 'class-validator';

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
  documentRepresentativeDni: string;

  @IsString()
  commerceChamberDocument: string;

  @IsEmail()
  billingEmail: string;

  @IsString()
  companyDocumentRut: string;

  @IsBoolean()
  ivaResponsable: boolean;

  @IsBoolean()
  taxPayer: boolean;

  @IsBoolean()
  selfRetaining: boolean;
}