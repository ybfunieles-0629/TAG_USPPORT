import { IsInt } from 'class-validator';

export class CreateTagDisccountPriceDto {
  @IsInt()
  quantity: number;

  @IsInt()
  price: number;
}