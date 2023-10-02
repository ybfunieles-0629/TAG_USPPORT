import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsInt()
  employeesNumber: number;

  @IsEmail()
  billingEmail: string;

  @IsString()
  deliveryAddress: string;

  @IsInt()
  margin: number;

  @IsInt()
  paymentTerms: number;

  @IsInt()
  annualSalesGoal: number;

  @IsInt()
  annualMonthlyGoals: number;

  @IsNumber()
  manageBrands: number;

  @IsNumber()
  manageOrders: number;

  @IsString()
  user: string;

  @IsArray()
  @IsString({ each: true })
  addresses: string[];
}
