import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLogoDto {
  @IsString()
  logo: string;

  @IsString()
  mounting: string;

  @IsString()
  markingService: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}