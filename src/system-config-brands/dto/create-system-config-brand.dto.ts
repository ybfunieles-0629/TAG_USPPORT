import { IsString } from 'class-validator';

export class CreateSystemConfigBrandDto {
  @IsString()
  name: string;
};