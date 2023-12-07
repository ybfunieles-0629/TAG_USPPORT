import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class FilterRefProductsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryTag?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  prices?: number[];

  @IsOptional()
  @IsInt()
  budget?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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