import { IsArray, IsBoolean, IsInt, IsString } from 'class-validator';

export class CalculatePriceDto {
  @IsArray()
  @IsString({ each: true })
  markingServiceProperties: string[];

  @IsBoolean()
  hasSample: boolean;

  @IsString()
  product: string;

  @IsInt()
  quantity: number;

  @IsInt()
  totalPrice: number;
}