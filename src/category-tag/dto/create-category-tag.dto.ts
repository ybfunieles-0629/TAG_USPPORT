import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryTagDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  categoryMargin: string;

  @IsOptional()
  @IsString()
  isSeason?: number;

  @IsOptional()
  @IsString()
  featured: number;

  @IsOptional()
  @IsString()
  offspringType: string;

  // @IsString()
  // image: string;

  @IsOptional()
  @IsString()
  mainCategory: string;

  @IsOptional()
  @IsString()
  parentCategory: string;
}