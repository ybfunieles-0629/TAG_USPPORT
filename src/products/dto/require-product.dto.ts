import { IsEmail, IsInt, IsString } from 'class-validator';

export class RequireProductDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  phone: number;

  @IsString()
  productName: string;

  @IsInt()
  quantity: number;

  @IsString()
  productDescription: string;
};