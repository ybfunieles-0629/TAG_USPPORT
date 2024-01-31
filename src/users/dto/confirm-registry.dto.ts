import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ConfirmRegistryDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsString()
  email: string;
};