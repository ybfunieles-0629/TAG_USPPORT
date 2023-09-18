import { IsArray, IsString } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  rolesId?: string[];
}