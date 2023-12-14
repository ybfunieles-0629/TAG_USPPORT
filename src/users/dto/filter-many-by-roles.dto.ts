import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class FilterManyByRolesDto {
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsBoolean()
  isCommercial?: boolean;
};