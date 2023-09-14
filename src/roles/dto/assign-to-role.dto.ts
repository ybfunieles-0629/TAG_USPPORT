import { IsArray, IsOptional, IsString } from 'class-validator';

export class AssignToRoleDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionsId?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  privilegesId?: string[];
}