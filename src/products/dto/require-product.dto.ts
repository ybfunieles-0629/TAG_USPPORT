import { IsEmail, IsInt, IsString, IsOptional } from 'class-validator';


export class RequireProductDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  productDescription: string;

 
};