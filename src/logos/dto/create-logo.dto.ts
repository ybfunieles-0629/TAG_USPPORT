import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLogoDto {
  @IsString()
  url: string;

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