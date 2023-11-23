import { IsDate, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCartQuoteDto {
  @IsString()
  quoteName: string;

  @IsString()
  description: string;

  @IsString()
  deliveryAddress: string;

  @IsInt()
  totalPrice: number;

  @IsInt()
  weightToOrder: number;

  @IsOptional()
  @IsDate()
  creationDate?: string;

  @IsOptional()
  @IsDate()
  updateDate?: Date;

  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsString()
  client: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}