import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';

@Entity('packings')
export class Packing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  unities: number;

  @Column('int', {

  })
  large: number;

  @Column('int', {

  })
  width: number;

  @Column('int', {

  })
  height: number;

  @Column('int', {

  })
  smallPackingWeight: number;

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

  //* --- FK --- *//
  @ManyToOne(() => Product, (product) => product.packings, { nullable: true })
  product: Product;

  @ManyToOne(() => RefProduct, (refProduct) => refProduct.packings)
  refProduct: RefProduct;
}