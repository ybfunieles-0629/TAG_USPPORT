import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRefProductDto {
  @IsString()
  name: string;

  @IsString()
  referenceCode: string;

  @IsString()
  referenceTagCode: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  mainCategory: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsInt()
  personalizableMarking: number;

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
  markedDesignArea: string;

  @IsString()
  supplier: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorySuppliers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliveryTimes?: string[];
}