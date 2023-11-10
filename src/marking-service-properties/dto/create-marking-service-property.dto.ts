import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMarkingServicePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  technicalPropertyTagService: string;

  @IsString()
  technicalSubTagProperty: string;

  @IsString()
  property: string;

  @IsInt()
  large: number;

  @IsInt()
  weigth: number;

  @IsString()
  externalSubTechnique: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;
}