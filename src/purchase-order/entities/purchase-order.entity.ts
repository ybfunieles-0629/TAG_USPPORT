import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
}