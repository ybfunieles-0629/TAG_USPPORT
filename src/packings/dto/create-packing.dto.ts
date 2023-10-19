import { IsInt, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsString()
  product: string;

  @IsOptional()
  @IsString()
  refProduct: string;
}