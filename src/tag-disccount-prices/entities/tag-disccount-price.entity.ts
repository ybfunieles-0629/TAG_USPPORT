import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from 'src/products/entities/product.entity';

@Entity('tag_disccount_prices')
export class TagDisccountPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  quantity: number;

  @Column('int', {

  })
  price: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToMany(() => Product, (product) => product.tagDisccountPrices)
  products?: Product[];
}