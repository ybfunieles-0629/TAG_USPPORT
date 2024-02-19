import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('discount_quantities')
export class DiscountQuantity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  quantity: number;

  @Column('float', {

  })
  price: number;

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
  @ManyToMany(() => Product, (product) => product.discountQuantities)
  products?: Product[];
}