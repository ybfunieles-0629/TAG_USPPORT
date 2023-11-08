import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommercialQualificationDto {
  @IsInt()
  kindness: number;

  @IsInt()
  responseTime: number;

  @IsInt()
  quoteTime: number;

  @IsString()
  comment: string;

  @IsString()
  purchaseOrder: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}