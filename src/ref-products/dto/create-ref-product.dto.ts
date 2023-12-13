import { IsArray, IsBoolean, IsDecimal, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRefProductDto {
  @IsString()
  name: string;

  @IsString()
  referenceCode: string;

  @IsString()
  referenceTagCode: string;

  @IsOptional()
  @IsNumber()
  isAllowed?: number;

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
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsInt()
  personalizableMarking: number;

  @IsDecimal()
  large: number;

  @IsDecimal()
  width: number;

  @IsDecimal()
  height: number;

  @IsDecimal()
  weight: number;

  @IsInt()
  productOnDemand: number;

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
  @IsString()
  markingServiceProperty?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorySuppliers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliveryTimes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantReferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];
}