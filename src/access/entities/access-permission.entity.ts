import { Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { Access } from '../../access/entities/access.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('access_permission')
export class AccessPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn({ name: 'roleId' })
  roleId: string;

  @PrimaryColumn({ name: 'permissionId' })
  permissionId: string;

  @ManyToOne(() => Access, (role) => role.permissions)
  @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
  roles: Access[];

  @ManyToOne(() => Permission, (permission) => permission.roles)
  @JoinColumn([{ name: 'permissionId', referencedColumnName: 'id' }])
  permissions: Permission[];
}