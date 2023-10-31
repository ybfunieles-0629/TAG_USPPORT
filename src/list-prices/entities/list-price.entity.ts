import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SupplierPrice } from '../../supplier-prices/entities/supplier-price.entity';

@Entity('list_prices')
export class ListPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  minimun: number;

  @Column('int', {

  })
  maximum: number;

  @Column('int', {
    
  })
  price: number;

  @Column('int', {

  })
  nextMinValue: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToOne(() => SupplierPrice, (supplierPrice) => supplierPrice.listPrices)
  supplierPrice: SupplierPrice;
}