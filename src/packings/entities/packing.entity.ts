import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => Product, (product) => product.packings)
  product: Product;
}