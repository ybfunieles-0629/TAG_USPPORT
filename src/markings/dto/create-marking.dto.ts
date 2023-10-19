import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMarkingDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  markingTechnique: string;

  @IsOptional()
  @IsInt()
  iva: number;

  @IsOptional()
  @IsString()
  markingTagService: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  markedServicePrices?: string[];
}