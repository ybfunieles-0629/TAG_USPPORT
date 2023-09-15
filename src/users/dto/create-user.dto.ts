import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  picture: string;

  @IsString()
  companyPosition: string;

  @IsString()
  @MinLength(9)
  dni: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsInt()
  phone: number;

  @IsOptional()
  @MinLength(3)
  password: string;

  @IsString()
  company: string;

  @IsString()
  role: string;
}
