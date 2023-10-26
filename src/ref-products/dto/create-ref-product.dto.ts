import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRefProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  disccountPromo?: number;

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
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

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
  @IsArray()
  @IsString({ each: true })
  markingServiceProperties?: string[];

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