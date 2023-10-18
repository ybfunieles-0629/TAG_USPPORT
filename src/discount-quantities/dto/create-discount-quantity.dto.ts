import { IsInt } from "class-validator";

export class CreateDiscountQuantityDto {
  @IsInt()
  quantity: number;

  @IsInt()
  price: number;
}