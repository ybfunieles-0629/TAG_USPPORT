import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CommercialQualification } from '../../commercial-qualification/entities/commercial-qualification.entity';
import { State } from '../../states/entities/state.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';
import { ShippingGuide } from '../../shipping-guides/entities/shipping-guide.entity';

@Entity('purchase_order')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  tagOrderNumber: string;

  @Column('varchar', {

  })
  clientOrderNumber: string;

  @Column('varchar', {

  })
  deliveryAddress: string;

  @Column('varchar', {

  })
  destinationCity: string;

  @Column('varchar', {

  })
  orderDocument: string;

  @Column('date', {

  })
  approvalDate: Date;

  @Column('date', {

  })
  creationDate: Date;

  @Column('date', {

  })
  paymentDate: Date;

  @Column('varchar', {
    
  })
  userApproval: string;

  @Column('date', {

  })
  invoiceIssueDate: Date;

  @Column('date', {

  })
  invoiceDueDate: Date;

  @Column('int', {

  })
  financingCost: number;

  @Column('int', {

  })
  feeCost: number;

  @Column('int', {

  })
  retentionCost: number;

  @Column('int', {

  })
  businessUtility: number;

  @Column('int', {
    default: 0,
  })
  billingNumber: number;

  @Column('date', {

  })
  expirationDate: Date;

  @Column('varchar', {

  })
  billingFile: string;

  @Column('varchar', {

  })
  clientUser: string;

  @Column('varchar', {

  })
  commercialUser: string;

  @Column('int', {

  })
  value: number;

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
  @OneToOne(() => CommercialQualification, (commercialQualification) => commercialQualification.purchaseOrder)
  @JoinColumn()
  commercialQualification: CommercialQualification;

  @OneToMany(() => OrderListDetail, (orderListDetail) => orderListDetail.purchaseOrder)
  orderListDetails: OrderListDetail[];

  @ManyToOne(() => ShippingGuide, (shippingGuide) => shippingGuide.purchaseOrder)
  shippingGuide: ShippingGuide;

  @ManyToOne(() => State, (state) => state.purchaseOrders)
  state: State;
}