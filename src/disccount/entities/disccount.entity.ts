import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Disccounts } from '../../disccounts/entities/disccounts.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('disccount')
export class Disccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  disccountType: string;

  @Column('int', {

  })
  entryDisccount: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @Column('varchar', {

  })
  createdBy: string;

  @Column('varchar', {

  })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @OneToMany(() => Disccounts, (disccounts) => disccounts.disccount)
  disccounts: Disccounts[];

  @ManyToOne(() => Supplier, (supplier) => supplier.disccounts)
  supplier: Supplier;

  @ManyToOne(() => Product, (product) => product.disccounts)
  product: Product;
}