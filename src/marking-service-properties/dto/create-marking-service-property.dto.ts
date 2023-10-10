import { IsString } from 'class-validator';

export class CreateMarkingServicePropertyDto {
  @IsString()
  technicalPropertyTagService: string;

  @IsString()
  technicalSubTagProperty: string;

  @IsString()
  property: string;
}