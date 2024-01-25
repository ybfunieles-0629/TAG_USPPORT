import { IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  // @IsString()
  // url: string;

  @IsOptional()
  @IsString()
  refProduct?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  tagSubTechniqueProperty?: string;

  @IsOptional()
  @IsString()
  markingServiceProperty?: string;
}