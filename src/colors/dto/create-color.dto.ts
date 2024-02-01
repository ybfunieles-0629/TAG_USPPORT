import { IsOptional, IsString } from 'class-validator';

export class CreateColorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  hexadecimalValue?: string;

  @IsOptional()
  @IsString()
  refProductId?: string;
}