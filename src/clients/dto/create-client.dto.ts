import { IsArray, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  legalStatus: string;
  
  @IsOptional()
  isCoorporative?: boolean;

  @IsInt()
  employeesNumber: number;

  @IsString()
  contactName: string;

  @IsString()
  contactPersonPicture: string;

  @IsString()
  contactPersonPosition: string;

  @IsString()
  contactPersonDni: string;

  @IsString()
  contactPersonCountry: string;

  @IsString()
  contactPersonCity: string;

  @IsString()
  contactPersonAddress: string;

  @IsEmail()
  contactPersonEmail: string;

  @IsString()
  contactPersonPhone: string;

  @IsString()
  company: string;

  @IsInt()
  margin: number;

  @IsInt()
  paymentTerms: number;

  @IsInt()
  annualSalesGoal: number;

  @IsInt()
  annualMonthlyGoals: number;

  @IsString()
  insideUsers: string;

  @IsOptional()
  password: string;
}
