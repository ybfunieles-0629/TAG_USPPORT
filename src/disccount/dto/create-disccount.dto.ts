import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateDisccountDto {
  @IsString()
  name: string;

  @IsString()
  disccountType: string;

  @IsInt()
  entryDisccount: number;
  
  @IsString()
  supplier: string;

  @IsArray()
  @IsString({ each: true })
  disccounts: string;
}