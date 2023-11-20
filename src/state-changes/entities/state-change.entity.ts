import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SupplierPurchaseOrder } from '../../supplier-purchase-orders/entities/supplier-purchase-order.entity';

@Entity('state_changes')
export class StateChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  state: string;

  @Column('date', {

  })
  date: Date;

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
  @ManyToOne(() => SupplierPurchaseOrder, (supplierPurchaseOrder) => supplierPurchaseOrder.stateChanges)
  supplierPurchaseOrder: SupplierPurchaseOrder;
}