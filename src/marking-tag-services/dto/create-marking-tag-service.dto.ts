import { IsString } from 'class-validator';

export class CreateMarkingTagServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  markingTechnique: string;

  @IsString()
  subMarkingTechnique: string;
}