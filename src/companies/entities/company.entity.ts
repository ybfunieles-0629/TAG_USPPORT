import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    unique: true,
  })
  name: string;

  @Column('varchar', {

  })
  webUrl: string;

  @Column('varchar', {
    
  })
  legalCapacity: string;

  @Column('varchar', {

  })
  nit: string;

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

  @Column('varchar', {

  })
  companyType: string;

  @Column('varchar', {

  })
  documentType: string;

  @Column('varchar', {
    
  })
  deliveryAddress: string;

  @Column('boolean', {
    default: false,
  })
  ivaResponsable: boolean;

  @Column('boolean', {
    default: false,
  })
  taxPayer: boolean;

  @Column('boolean', {
    default: false,
  })
  selfRetaining: boolean;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(
    () => User,
    (user) => user.company
  )
  user: User[];
}