import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

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

  
}