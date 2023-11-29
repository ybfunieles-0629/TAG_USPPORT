import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class FilterRefProductsDto {
  @IsOptional()
  @IsString()
  @IsArray({ each: true })
  categoryTag?: string[];

  @IsOptional()
  @IsString()
  @IsArray({ each: true })
  colors?: string[];

  @IsOptional()
  @IsInt()
  @IsArray()
  prices?: number[];

  @IsOptional()
  @IsInt()
  budget?: number;

  @IsOptional()
  @IsString()
  @IsArray({ each: true })
  variantReferences?: string[];

  @IsOptional()
  @IsInt()
  inventory?: number;

  @IsOptional()
  @IsBoolean()
  isAsc?: boolean;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDiscount?: boolean;
}