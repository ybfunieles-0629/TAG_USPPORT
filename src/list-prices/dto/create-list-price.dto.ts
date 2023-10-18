import { IsInt } from 'class-validator';

export class CreateListPriceDto {
  @IsInt()
  minimum: number;

  @IsInt()
  maximum: number;

  @IsInt()
  price: number;

  @IsInt()
  nextMinValue: number;
}