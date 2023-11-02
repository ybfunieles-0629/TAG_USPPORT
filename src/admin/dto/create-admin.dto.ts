import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  adminType: string;

  @IsString()
  adminDesc: string;

  @IsOptional()
  idClientBoss?: string;

  @IsString()
  user: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clients: string[];
}