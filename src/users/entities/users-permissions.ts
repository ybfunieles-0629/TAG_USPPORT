// import { Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

// import { Permission } from '../../permissions/entities/permission.entity';

// @Entity('users_have_permissions')
// export class UsersPermissions {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @PrimaryColumn({ name: 'roleId' })
//   roleId: string;

//   @PrimaryColumn({ name: 'permissionId' })
//   permissionId: string;

//   @ManyToOne(() => Access, (role) => role.permissions)
//   @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
//   roles: Access[];

//   @ManyToOne(() => Permission, (permission) => permission.roles)
//   @JoinColumn([{ name: 'permissionId', referencedColumnName: 'id' }])
//   permissions: Permission[];
// }