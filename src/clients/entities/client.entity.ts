import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Access } from '../../access/entities/access.entity';
import { User } from '../../users/entities/user.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  legalStatus: string;

  @Column('boolean', {
    default: false,
  })
  isCoorporative: boolean;

  @Column('int', {

  })
  employeesNumber: number;

  @Column('varchar', {

  })
  contactName: string;

  @Column('varchar', {
    
  })
  contactPersonPicture: string;

  @Column('varchar', {
    
  })
  contactPersonPosition: string;

  @Column('varchar', {
    
  })
  contactPersonDni: string;

  @Column('varchar', {
    
  })
  contactPersonCountry: string;

  @Column('varchar', {
    
  })
  contactPersonCity: string;

  @Column('varchar', {
    
  })
  contactPersonAddress: string;

  @Column('varchar', {
    
  })
  contactPersonEmail: string;

  @Column('varchar', {
    
  })
  contactPersonPhone: string;

  @Column('int', {
    
  })
  margin: number;

  @Column('int', {
    
  })
  paymentTerms: number;

  @Column('int', {
    
  })
  annualSalesGoal: number;

  @Column('int', {
    
  })
  annualMonthlyGoals: number;

  @Column('varchar', {
    
  })
  insideUsers: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToOne(
    () => Access,
    (access) => access.client, {
      onDelete: 'CASCADE'
    },
  )
  @JoinColumn()
  access: Access;

  @ManyToMany(() => User, (user) => user.clients)
  users?: User[];
}