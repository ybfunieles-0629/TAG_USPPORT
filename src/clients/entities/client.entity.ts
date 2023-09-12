import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  legalStatus: string;

  @Column('boolean', {

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
  insideUsers: User[];

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
}