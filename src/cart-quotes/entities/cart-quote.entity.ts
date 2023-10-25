import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { State } from '../../states/entities/state.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('cart_quotes')
export class CartQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  quoteName: string;

  @Column('varchar', {

  })
  description: string;

  @Column('int', {

  })
  totalPrice: number;

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
  @OneToOne(() => State, (state) => state.cartQuote)
  @JoinColumn()
  state: State;

  @OneToMany(() => QuoteDetail, (quoteDetail) => quoteDetail.cartQuote)
  quoteDetails?: QuoteDetail[];

  @ManyToOne(() => User, (user) => user.cartQuotes)
  user: User;

  @ManyToOne(() => Client, (client) => client.cartQuotes)
  client: Client;
}