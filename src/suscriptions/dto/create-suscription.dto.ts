import { IsEmail } from 'class-validator';

export class CreateSuscriptionDto {
  @IsEmail()
  email: string;
}