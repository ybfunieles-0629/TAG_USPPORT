import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TransportService } from '../../transport-services/entities/transport-service.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';
import { CartQuote } from '../../cart-quotes/entities/cart-quote.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('quote_details')
export class QuoteDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  quantities: string;

  @Column('int', {

  })
  totalPriceWithTransport: number;

  @Column('int', {

  })
  transportServiceTagClient: number;

  @Column('varchar', {

  })
  negotiationDiscount: number;

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
  @OneToMany(() => TransportService, (transportService) => transportService.quoteDetail)
  transportServices?: TransportService[];

  @OneToMany(() => MarkingService, (markingService) => markingService.quoteDetail)
  markingServices?: MarkingService[];

  @ManyToOne(() => CartQuote, (cartQuote) => cartQuote.quoteDetails)
  cartQuote: CartQuote;

  @ManyToOne(() => Product, (product) => product.quoteDetails)
  product: Product;
}