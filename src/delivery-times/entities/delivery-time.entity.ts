import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('delivery_times')
export class DeliveryTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('int', {
    
  })
  minimun: number;

  @Column('int', {

  })
  maximun: number;

  @Column('int', {

  })
  timeInDays: number;

  @Column('int', {

  })
  minimunAdvanceValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToOne(() => RefProduct, (refProduct) => refProduct.deliveryTimes)
  refProduct: RefProduct;

  @ManyToOne(() => Product, (product) => product.deliveryTimes)
  product: Product;
}