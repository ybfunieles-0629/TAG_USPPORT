// import { Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
// import { Role } from './role.entity';
// import { Permission } from '../../permissions/entities/permission.entity';

// @Entity('role_permission')
// export class RolePermission {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @PrimaryColumn({ name: 'roleId' })
//   roleId: string;

//   @PrimaryColumn({ name: 'permissionId' })
//   permissionId: string;

//   @ManyToOne(() => Role, (role) => role.permissions)
//   @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
//   roles: Role[];

//   @ManyToOne(() => Permission, (permission) => permission.roles)
//   @JoinColumn([{ name: 'permissionId', referencedColumnName: 'id' }])
//   permissions: Permission[];
// }