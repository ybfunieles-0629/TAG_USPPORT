import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SupplierType } from '../../supplier-types/entities/supplier-type.entity';
import { SubSupplierProductType } from 'src/sub-supplier-product-types/entities/sub-supplier-product-type.entity';

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
  @OneToMany(() => SupplierType, (supplierType) => supplierType.suppliers)
  supplierType: SupplierType;

  @OneToMany(() => SubSupplierProductType, (subSupplierProductType) => subSupplierProductType.suppliers)
  subSupplierProductType: SubSupplierProductType;
}