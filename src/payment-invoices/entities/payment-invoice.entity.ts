import { SupplierPurchaseOrder } from '../../supplier-purchase-orders/entities/supplier-purchase-order.entity';

import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('payment_invoices')
export class PaymentInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  amount: number;

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
  @ManyToOne(() => SupplierPurchaseOrder, (supplierPurchaseOrder) => supplierPurchaseOrder.paymentInvoices)
  supplierPurchaseOrder: SupplierPurchaseOrder;
}