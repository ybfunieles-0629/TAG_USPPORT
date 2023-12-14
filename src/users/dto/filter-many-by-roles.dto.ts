import { IsArray, IsString } from 'class-validator';

export class FilterManyByRolesDto {
  @IsArray()
  @IsString({ each: true })
  roles: string[];
};