import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK ---*//
  @ManyToOne(() => RefProduct, (refProduct) => refProduct.images)
  refProduct: RefProduct;
}