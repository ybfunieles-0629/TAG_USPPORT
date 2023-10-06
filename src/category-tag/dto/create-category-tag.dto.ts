import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryTagDto {
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
}