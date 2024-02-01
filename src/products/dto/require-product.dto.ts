import { IsEmail, IsInt, IsString } from 'class-validator';

export class RequireProductDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  productName: string;

  @IsString()
  quantity: string;

  @IsString()
  productDescription: string;
};