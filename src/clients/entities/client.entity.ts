import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Address } from '../../addresses/entities/address.entity';
import { User } from '../../users/entities/user.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { CartQuote } from '../../cart-quotes/entities/cart-quote.entity';
import { Admin } from '../../admin/entities/admin.entity';

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
  @OneToOne(() => User, (user) => user.client, { onDelete: 'CASCADE' })
  user: User;
  
  @OneToMany(() => Address, (address) => address.client)
  addresses: Address[];

  @OneToMany(() => CartQuote, (cartQuote) => cartQuote.client)
  cartQuotes?: CartQuote[];

  @ManyToOne(() => Admin, (admin) => admin.clients)
  admin: Admin;
}