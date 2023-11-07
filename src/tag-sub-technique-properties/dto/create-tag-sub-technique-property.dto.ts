import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateTagSubTechniquePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;

  @IsString()
  @IsOptional()
  tagSubTechnique?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string;
}