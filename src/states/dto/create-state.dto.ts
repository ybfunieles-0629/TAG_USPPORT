import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStateDto {
  @IsString()
  name: string;

  @IsString()
  process: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy: string;
}