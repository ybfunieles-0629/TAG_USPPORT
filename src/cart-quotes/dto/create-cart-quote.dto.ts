import { IsBoolean, IsDate, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCartQuoteDto {
  @IsString()
  quoteName: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsString()
  description: string;

  @IsString()
  destinationCity: string;

  @IsString()
  deliveryAddress: string;

  @IsInt()
  totalPrice: number;

  @IsOptional()
  @IsInt()
  productsQuantity: number;

  @IsInt()
  weightToOrder: number;

  @IsOptional()
  creationDate?: Date;

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

  @IsOptional()
  @IsString()
  PostalCode: string;
}