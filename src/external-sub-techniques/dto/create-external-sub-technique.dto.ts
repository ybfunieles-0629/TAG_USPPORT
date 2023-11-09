import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExternalSubTechniqueDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  marking?: string;

  @IsOptional()
  @IsString()
  tagSubTechnique?: string;
}