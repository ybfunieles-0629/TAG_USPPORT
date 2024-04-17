import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, isInt } from 'class-validator';

export class DiscountQuoteDetailDto {

  @IsInt()
  @IsOptional()
  discount: number;


}