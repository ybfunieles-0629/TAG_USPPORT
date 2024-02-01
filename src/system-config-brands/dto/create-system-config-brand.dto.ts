import { IsOptional, IsString } from 'class-validator';

export class CreateSystemConfigBrandDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brandType: string;
};