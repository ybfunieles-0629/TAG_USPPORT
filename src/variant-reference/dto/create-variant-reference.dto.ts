import { IsString } from 'class-validator';

export class CreateVariantReferenceDto {
  @IsString()
  name: string;

  @IsString()
  variableValue: string;
}