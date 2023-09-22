import { IsOptional, IsString, MinLength } from 'class-validator';

import { Permission } from '../../permissions/entities/permission.entity';

export class CreateRoleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  permissions?: Permission[];
}