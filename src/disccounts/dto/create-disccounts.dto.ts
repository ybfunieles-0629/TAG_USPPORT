import { IsInt } from "class-validator";

export class CreateDisccountsDto {
  @IsInt()
  minQuantity: number;

  @IsInt()
  maxQuantity: number;

  @IsInt()
  nextMinValue: number;

  @IsInt()
  disccountValue: number;
}