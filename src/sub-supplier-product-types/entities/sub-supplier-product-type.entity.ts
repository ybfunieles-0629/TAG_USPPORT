import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('sub_supplier_product_type')
export class SubSupplierProductType {
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
  @OneToMany(() => Supplier, (supplier) => supplier.subSupplierProductType)
  suppliers: Supplier[];
}