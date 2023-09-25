import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Access } from '../../access/entities/access.entity';
import { Company } from '../../companies/entities/company.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    unique: true,
  })
  email: string;

  @Column('varchar', {

  })
  phone: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- Foreign Keys --- *//
  @OneToOne(
    () => Access,
    (access) => access.user, {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  access: Access;

  @ManyToOne(
    () => Company,
    (company) => company.user
  )
  company: Company;

  @ManyToMany(() => Client, (client) => client.users)
  @JoinTable({
    name: 'user_client',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'clientId',
      referencedColumnName: 'id',
    },
  })
  clients?: Client[];
}
