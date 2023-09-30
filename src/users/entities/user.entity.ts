import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Admin } from '../../admin/entities/admin.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { Privilege } from '../../privileges/entities/privilege.entity';
import { Company } from '../../companies/entities/company.entity';
import { Client } from '../../clients/entities/client.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Brand } from '../../brands/entities/brand.entity';

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
  mainSecondaryUser: number;

  @Column('int', {

  })
  canBuy: number;

  @Column('int', {
    default: 0
  })
  isCoorporative: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToOne(() => Admin, (admin) => admin.user)
  @JoinColumn()
  admin: Admin;

  @OneToOne(() => Client, (client) => client.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: Client;

  @OneToOne(() => Supplier, (supplier) => supplier.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  supplier: Supplier;
  
  @OneToMany(() => Brand, (brand) => brand.user)
  brands: Brand[];

  @ManyToOne(() => Company, (company) => company.users, { onDelete: 'CASCADE' })
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
