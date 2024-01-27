import { IsEmail, IsString } from 'class-validator';

export class ConfirmRegistryDto {
  @IsString()
  code: string;

  @IsString()
  email: string;
};