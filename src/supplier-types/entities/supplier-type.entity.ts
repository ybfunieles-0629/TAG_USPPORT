import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('supplier_types')
export class SupplierType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => Supplier, (supplier) => supplier.supplierType)
  suppliers: Supplier[];
}
