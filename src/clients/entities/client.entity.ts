import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Address } from 'src/addresses/entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Brand } from 'src/brands/entities/brand.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  employeesNumber: number;

  @Column('varchar', {

  })
  billingEmail: string;

  @Column('int', {

  })
  margin: number;

  @Column('varchar', {

  })
  deliveryAddress: string;

  @Column('int', {

  })
  paymentTerms: number;

  @Column('int', {

  })
  annualSalesGoal: number;

  @Column('int', {

  })
  annualMonthlyGoals: number;

  @Column('int', {

  })
  manageBrands: number;

  @Column('int', {

  })
  manageOrders: number;

  @Column('varchar', {

  })
  commercialId: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => Address, (address) => address.client)
  addresses: Address[];

  @OneToOne(() => User, (user) => user.client, { onDelete: 'CASCADE' })
  user: User;
}