import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TransportService } from '../../transport-services/entities/transport-service.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';
import { CartQuote } from '../../cart-quotes/entities/cart-quote.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('quote_details')
export class QuoteDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  quantities: number;

  @Column('int', {
    default: 0
  })
  additionalDiscount: number;

  @Column('int', {

  })
  unitPrice: number;

  @Column('boolean', {
    default: false,
  })
  hasSample: boolean;

  @Column('int', {

  })
  discountPercentage: number;

  @Column('int', {

  })
  totalPriceWithTransport: number;

  @Column('int', {

  })
  transportTotalPrice: number;

  @Column('int', {

  })
  transportServiceTagClient: number;

  @Column('int', {

  })
  negotiationDiscount: number;

  @Column('int', {

  })
  totalValue: number;
  
  @Column('int', {

  })
  businessMarginProfit: number;

  @Column('int', {

  })
  totalValueWithoutIva: number;

  @Column('int', {

  })
  unitDiscount: number;

  @Column('int', {

  })
  markingTotalPrice: number;

  @Column('int', {

  })
  markingPriceWithIva: number;

  @Column('int', {

  })
  markingPriceWith4x1000: number;

  @Column('int', {

  })
  markingWithProductSupplierTransport: number;

  @Column('int', {

  })
  transportServices4x1000: number;

  @Column('int', {

  })
  aditionalClientFee: number;
  
  @Column('int', {

  })
  withholdingAtSourceValue: number;

  @Column('int', {

  })
  businessUtility: number;

  @Column('int', {

  })
  sampleValue: number;

  @Column('int', {

  })
  maximumDiscount: number;

  @Column('int', {

  })
  subTotal: number;

  @Column('int', {

  })
  discount: number;

  @Column('int', {

  })
  subTotalWithDiscount: number;

  @Column('int', {

  })
  iva: number;

  @Column('int', {

  })
  total: number;

  @Column('int', {

  })
  totalCost: number;

  @Column('int', {

  })
  financingCost: number;

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