import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  companyType: string;

  @Column('varchar', {
    unique: true,
  })
  name: string;

  @Column('varchar', {

  })
  logo: string;

  @Column('varchar', {

  })
  webUrl: string;

  @Column('varchar', {
    
  })
  legalCapacity: string;

  @Column('varchar', {

  })
  documentType: string;

  @Column('varchar', {

  })
  nit: string;

  @Column('varchar', {

  })
  dniRepresentativeDocument: string;

  @Column('varchar', {
    
  })
  commerceChamberDocument: string;

  @Column('varchar', {

  })
  billingEmail: string;

  @Column('varchar', {

  })
  rutCompanyDocument: string;

  @Column('int', {

  })
  ivaResponsable: number;

  @Column('int', {

  })
  taxPayer: number;

  @Column('int', {

  })
  selfRetaining: number;

  @Column('int', {

  })
  fee: number;

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
  postalCode: string;

  @Column('varchar', {

  })
  gpsLocation: string;

  @Column('varchar', {

  })
  deliveryAddress: string;

  @Column('varchar', {

  })
  mainAddress: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => User, (user) => user.company)
  users: User[];
}