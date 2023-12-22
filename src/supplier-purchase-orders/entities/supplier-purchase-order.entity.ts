import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { StateChange } from '../../state-changes/entities/state-change.entity';
import { State } from '../../states/entities/state.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';

@Entity('supplier_purchase_orders')
export class SupplierPurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  orderCode: string;

  @Column('varchar', {
    
  })
  tagPurchaseOrderDocument: string;

  @Column('int', {

  })
  cost: number;

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
  @OneToMany(() => OrderListDetail, (orderListDetail) => orderListDetail.supplierPurchaseOrder)
  orderListDetails: OrderListDetail[];

  @OneToMany(() => StateChange, (stateChange) => stateChange.supplierPurchaseOrder)
  stateChanges: StateChange[];

  @ManyToOne(() => State, (state) => state.supplierPurchaseOrders)
  state: State;
}