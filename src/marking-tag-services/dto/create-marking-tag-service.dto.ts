import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMarkingTagServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy: string;
}