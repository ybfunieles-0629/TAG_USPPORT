import { IsOptional, IsString } from 'class-validator';

export class CreateMarkingServicePropertyDto {
  @IsString()
  technicalPropertyTagService: string;

  @IsString()
  technicalSubTagProperty: string;

  @IsString()
  property: string;

  @IsString()
  externalSubTechnique: string;

  @IsOptional()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;
}