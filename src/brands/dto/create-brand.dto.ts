import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  fee: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  access?: string;
}