import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SupplierType } from '../../supplier-types/entities/supplier-type.entity';
import { SubSupplierProductType } from '../../sub-supplier-product-types/entities/sub-supplier-product-type.entity';
import { User } from '../../users/entities/user.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  adminType: string;

  @Column('varchar', {

  })
  supplierDesc: string;

  @Column('varchar', {

  })
  pickupAddress: string;

  @Column('int', {

  })
  profitMargin: number;

  @Column('int', {

  })
  hasApi: number;

  @Column('int', {

  })
  paymentDeadline: number;

  @Column('int', {

  })
  advancePercentage: number;

  @Column('boolean', {
    default: true,
  })
  bills: boolean;

  @Column('varchar', {

  })
  bankAccountType: string;
  
  @Column('varchar', {
    unique: true,
  })
  bankAccountNumber: string;

  @Column('varchar', {

  })
  bankAccount: string;

  @Column('varchar', {

  })
  portfolio: string;

  @Column('int', {

  })
  scheduledDaysToUpdate: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => SupplierType, (supplierType) => supplierType.suppliers)
  supplierType: SupplierType;

  @ManyToOne(() => SubSupplierProductType, (subSupplierProductType) => subSupplierProductType.suppliers)
  subSupplierProductType: SubSupplierProductType;

  @OneToOne(() => User, (user) => user.supplier)
  user: User;
}