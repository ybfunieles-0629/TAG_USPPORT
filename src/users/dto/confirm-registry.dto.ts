import { IsEmail, IsString } from 'class-validator';

export class ConfirmRegistryDto {
  @IsString()
  code: string;

  @IsEmail()
  email: string;
};