import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSuscriptionDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  isActive: string;

}