// import { Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
// import { Role } from './role.entity';

// @Entity('role_privilege')
// export class RolePrivilege {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @PrimaryColumn({ name: 'roleId '})
//   roleId: string;

//   @PrimaryColumn({ name: 'privilegeId' })
//   privilegeId: string;

//   @ManyToOne(() => Role, (role) => role.privileges)
//   @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
//   roles: Role[];
// }