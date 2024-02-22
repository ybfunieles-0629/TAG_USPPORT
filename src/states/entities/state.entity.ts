import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CartQuote } from '../../cart-quotes/entities/cart-quote.entity';
import { PurchaseOrder } from '../../purchase-order/entities/purchase-order.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';
import { SupplierPurchaseOrder } from '../../supplier-purchase-orders/entities/supplier-purchase-order.entity';
import { StatusHistory } from '../../status-history/entities/status-history.entity';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  process: string;

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
  @OneToMany(() => CartQuote, (cartQuote) => cartQuote.state)
  cartQuotes: CartQuote[];

  @OneToMany(() => StatusHistory, (statusHistory) => statusHistory.state)
  statusHistories?: StatusHistory[];

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.state)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => OrderListDetail, (orderListDetail) => orderListDetail.state)
  orderListDetails: OrderListDetail[];

  @OneToMany(() => SupplierPurchaseOrder, (supplierPurchaseOrder) => supplierPurchaseOrder.state)
  supplierPurchaseOrders: SupplierPurchaseOrder[];
}