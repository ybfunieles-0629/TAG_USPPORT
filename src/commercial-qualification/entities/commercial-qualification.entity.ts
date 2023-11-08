import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PurchaseOrder } from '../../purchase-order/entities/purchase-order.entity';

@Entity('commercial_qualification')
export class CommercialQualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  kindness: number;

  @Column('int', {
    
  })
  responseTime: number;

  @Column('int', {

  })
  quoteTime: number;


  @Column('varchar', {

  })
  comment: string;

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
  @OneToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.commercialQualification)
  purchaseOrder: PurchaseOrder;
}