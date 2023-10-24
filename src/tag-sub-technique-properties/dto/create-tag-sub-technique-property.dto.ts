import { IsOptional, IsString } from 'class-validator';

export class CreateTagSubTechniquePropertyDto {
  @IsString()
  name: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;

  @IsString()
  @IsOptional()
  tagSubTechnique?: string;
}