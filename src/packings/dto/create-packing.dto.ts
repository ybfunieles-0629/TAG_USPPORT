import { IsInt } from 'class-validator';

export class CreatePackingDto {
  @IsInt()
  unities: number;

  @IsInt()
  large: number;

  @IsInt()
  width: number;

  @IsInt()
  height: number;

  @IsInt()
  smallPackingWeight: number;
}