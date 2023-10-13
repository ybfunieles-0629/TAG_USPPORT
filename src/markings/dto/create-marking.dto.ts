import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateMarkingDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  markingTechnique: string;

  @IsInt()
  iva: number;

  @IsString()
  markingTagService: string;

  @IsString()
  company: string;

  @IsArray()
  @IsString({ each: true })
  markedServicePrices?: string[];
}