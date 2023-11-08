import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CommercialQualification } from '../../commercial-qualification/entities/commercial-qualification.entity';

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

  @Column('boolean', {
    default: true,
  })
  isActive: true;

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
  commercialQualification: CommercialQualification;
}