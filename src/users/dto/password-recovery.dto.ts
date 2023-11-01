import { IsEmail, IsJWT, IsOptional, IsString } from 'class-validator';

export class PasswordRecoveryDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsJWT()
  token?: string;
}