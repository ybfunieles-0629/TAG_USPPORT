import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSuscriptionDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  isActive: string;

}