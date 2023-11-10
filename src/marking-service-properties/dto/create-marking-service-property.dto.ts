import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMarkingServicePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  
  @IsInt()
  large: number;
  
  @IsInt()
  weigth: number;
  
  @IsString()
  tagSubTechniqueProperty: string;

  @IsString()
  externalSubTechnique: string;

  @IsOptional()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;
}