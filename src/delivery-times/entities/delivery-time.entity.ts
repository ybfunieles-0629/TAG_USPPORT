import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('delivery_times')
export class DeliveryTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('int', {
    
  })
  minimum: number;

  @Column('int', {

  })
  maximum: number;

  @Column('int', {

  })
  timeInDays: number;

  @Column('int', {

  })
  minimumAdvanceValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToMany(() => RefProduct, (refProduct) => refProduct.deliveryTimes)
  refProducts: RefProduct[];

  @ManyToOne(() => Product, (product) => product.deliveryTimes)
  product: Product;

  @ManyToOne(() => Supplier, (supplier) => supplier.deliveryTimes)
  supplier: Supplier;
}