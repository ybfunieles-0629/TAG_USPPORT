import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateCategorySupplierDto {
  @IsString()
  offspringType: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  categoryMargin: string;

  @IsInt()
  featured: number;

  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  mainCategory: string;

  @IsOptional()
  @IsString()
  parentCategory: string;

  @IsString()
  categoryTag: string;

  @IsOptional()
  @IsString()
  supplier: string;
}
