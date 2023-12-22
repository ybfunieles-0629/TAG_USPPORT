import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PurchaseOrder } from '../../purchase-order/entities/purchase-order.entity';

@Entity('shipping_guides')
export class ShippingGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    unique: true,
  })
  guideCode: string;

  @Column('varchar', {

  })
  url: string;

  @Column('varchar', {

  })
  deliveryProof: string;

  @Column('int', {

  })
  boxQuantities: number;

  @Column('varchar', {

  })
  createdBy: string;

  @Column('varchar', {

  })
  updatedBy: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.shippingGuide)
  purchaseOrder: PurchaseOrder[];
};