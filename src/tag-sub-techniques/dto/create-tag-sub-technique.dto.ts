import { IsOptional, IsString } from 'class-validator';

export class CreateTagSubTechniqueDto {
  @IsString()
  name: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;

  @IsString()
  markingTagService: string;
}