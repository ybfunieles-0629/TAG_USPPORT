import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { State } from '../../states/entities/state.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';

@Entity('cart_quotes')
export class CartQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  quoteName: string;

  @Column('varchar', {

  })
  brandId: string;

  @Column('int', {

  })
  withholdingAtSourceValue: number;
 
  @Column('int', {

  })
  fee: number;

  @Column('varchar', {

  })
  description: string;

  @Column('varchar', {

  })
  destinationCity: string;

  @Column('varchar', {

  })
  deliveryAddress: string;

  @Column('int', {

  })
  totalPrice: number;

  @Column('int', {

  })
  productsQuantity: number;

  @Column('int', {

  })
  weightToOrder: number;

  @Column('date', {

  })
  creationDate: Date;

  @Column('date', {

  })
  dateUpdate: Date;

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
  @ManyToOne(() => State, (state) => state.cartQuotes)
  state: State;

  @OneToOne(() => OrderListDetail, (orderListDetail) => orderListDetail.cartQuote)
  @JoinColumn()
  orderListDetail: OrderListDetail;

  @OneToMany(() => QuoteDetail, (quoteDetail) => quoteDetail.cartQuote)
  quoteDetails?: QuoteDetail[];

  @ManyToOne(() => User, (user) => user.cartQuotes)
  user: User;

  @ManyToOne(() => Client, (client) => client.cartQuotes)
  client: Client;
}