import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  fee: string;

  @IsOptional()
  @IsString()
  access?: string;
}