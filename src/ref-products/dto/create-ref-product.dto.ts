import { IsBoolean, IsDecimal, IsInt, IsString } from 'class-validator';

export class CreateRefProductDto {
  @IsString()
  name: string;

  @IsString()
  referenceCode: string;

  @IsString()
  referenceTagCode: string;

  @IsString()
  description: string;

  @IsString()
  mainCategory: string;

  @IsString()
  keywords: string;

  @IsDecimal()
  large: number;

  @IsDecimal()
  width: number;

  @IsDecimal()
  height: number;

  @IsDecimal()
  weight: number;

  @IsString()
  importedNational: string;

  @IsInt()
  minQuantity: number;

  @IsInt()
  productInventoryLeadTime: number;

  @IsInt()
  productNoInventoryLeadTime: number;
}