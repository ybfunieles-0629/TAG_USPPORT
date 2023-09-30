import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  picture: string;

  @IsString()
  companyPosition: string;

  @IsString()
  @IsOptional()
  @MinLength(9)
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

  @IsString()
  @IsOptional()
  company?: string;

  @IsArray()
  @IsString({ each: true })
  brands: string[];

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
  
  @IsArray()
  @IsString({ each: true })
  privileges: string[];
}
