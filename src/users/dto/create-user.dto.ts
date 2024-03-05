import { IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  picture: string;

  @IsBoolean()
  termsAndConditions: boolean;

  @IsBoolean()
  accessPolicies: boolean;

  @IsString()
  companyPosition: string;

  @IsString()
  @IsOptional()
  @MinLength(7)
  dni?: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsNumber()
  mainSecondaryUser: number;

  @IsNumber()
  canBuy: number;
  
  @IsNumber()
  isCoorporative: number;

  @IsNumber()
  @IsOptional()
  isAllowed: number;

  @IsString()
  @IsOptional()
  company?: string;

  @IsArray()
  @IsString({ each: true })
  brands: string[];

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  privileges?: string[];
}
