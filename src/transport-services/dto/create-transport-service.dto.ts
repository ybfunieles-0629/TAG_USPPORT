import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransportServiceDto {
  @IsInt()
  api: number;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;

  @IsString()
  quoteDetail: string;
}