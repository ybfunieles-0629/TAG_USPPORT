import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';

@Entity('order_ratings')
export class OrderRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  deliveryTime: number;

  @Column('int', {

  })
  packingQuality: number;

  @Column('int', {

  })
  productQuality: number;

  @Column('int', {

  })
  markingQuality: number;

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
  @OneToOne(() => OrderListDetail, (orderListDetail) => orderListDetail.orderRating)
  orderListDetail: OrderListDetail;
}