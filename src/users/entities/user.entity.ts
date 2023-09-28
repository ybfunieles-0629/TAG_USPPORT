import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Admin } from '../../admin/entities/admin.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { Privilege } from '../../privileges/entities/privilege.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Client } from 'src/clients/entities/client.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('varchar', {
    unique: true,
  })
  email: string;

  @Column('varchar', {

  })
  password: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  picture: string;

  @Column('varchar', {

  })
  companyPosition: string;

  @Column('varchar', {
    unique: true,
  })
  dni: string;

  @Column('varchar', {

  })
  country: string;

  @Column('varchar', {

  })
  city: string;

  @Column('varchar', {

  })
  address: string;

  @Column('varchar', {

  })
  phone: string;

  @Column('int', {

  })
  manageCommercial: number;
  
  @Column('int', {

  })
  mainSecondaryUser: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => Admin, (admin) => admin.user)
  admin: Admin[];

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'users_have_roles',
    joinColumn: {
      name: 'accessId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles?: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users)
  @JoinTable({
    name: 'users_have_permissions',
    joinColumn: {
      name: 'accessId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id',
    },
  })
  permissions?: Permission[];

  @ManyToMany(() => Privilege, (privilege) => privilege.users)
  @JoinTable({
    name: 'users_have_privileges',
    joinColumn: {
      name: 'accessId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'privilegeId',
      referencedColumnName: 'id',
    },
  })
  privileges?: Privilege[];
}
