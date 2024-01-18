import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDisccountDto {
  @IsString()
  name: string;

  @IsString()
  disccountType: string;

  @IsOptional()
  @IsInt()
  entryDisccount: number;
  
  @IsString()
  supplier: string;

  @IsArray()
  @IsString({ each: true })
  disccounts: string;
}