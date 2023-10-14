import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';

@Entity('DeliveryTimes')
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
  @ManyToMany(() => RefProduct, (refProduct) => refProduct.deliveryTimes)
  refProducts?: RefProduct[];
}