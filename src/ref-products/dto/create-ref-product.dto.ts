import { IsArray, IsBoolean, IsInt, IsString } from 'class-validator';

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

  @IsInt()
  large: number;

  @IsInt()
  width: number;

  @IsInt()
  height: number;

  @IsInt()
  weight: number;

  @IsString()
  importedNational: string;

  @IsInt()
  minQuantity: number;

  @IsInt()
  productInventoryLeadTime: number;

  @IsInt()
  productNoInventoryLeadTime: number;

  @IsString()
  marketDesignArea: string;

  @IsString()
  supplier: string;
}