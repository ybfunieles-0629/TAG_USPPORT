import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { RefProduct } from 'src/ref-products/entities/ref-product.entity';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  code: string;

  @Column('varchar', {

  })
  image: string;

  @Column('varchar', {

  })
  refProductId: string;

  @Column('varchar', {
    
  })
  hexadecimalValue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  udpatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => Product, (product) => product.colors)
  product: Product;

  @ManyToMany(() => RefProduct, (refProduct) => refProduct.colors)
  refProducts?: RefProduct[];
}