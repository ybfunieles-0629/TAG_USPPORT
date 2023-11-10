import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransportServiceDto {
  @IsInt()
  api: number;

  @IsInt()
  insurance: number;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  quoteDetail?: string;
}