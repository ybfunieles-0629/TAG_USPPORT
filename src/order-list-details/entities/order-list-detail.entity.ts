import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PurchaseOrder } from '../../purchase-order/entities/purchase-order.entity';
import { OrderRating } from '../../order-ratings/entities/order-rating.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';
import { TransportService } from '../../transport-services/entities/transport-service.entity';
import { State } from '../../states/entities/state.entity';
import { Product } from '../../products/entities/product.entity';
import { CartQuote } from '../../cart-quotes/entities/cart-quote.entity';

@Entity('order_list_details')
export class OrderListDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  orderCode: string;

  @Column('int', {

  })
  quantities: number;

  @Column('int', {

  })
  productTotalPrice: number;

  @Column('varchar', {

  })
  clientTagTransportService: string;

  @Column('int', {

  })
  estimatedProfit: number;

  @Column('int', {

  })
  realProfit: number;

  @Column('date', {

  })
  estimatedMarketDate: Date;
  
  @Column('date', {

  })
  estimatedDeliveryDate: Date;

  @Column('date', {

  })
  expirationDate: Date;

  @Column('varchar', {

  })
  deliveryProofDocument: string;

  @Column('int', {

  })
  realCost: number;

  @Column('int', {

  })
  estimatedQuoteCost: number;

  @Column('varchar', {

  })
  costNote: string;

  @Column('varchar', {
    
  })
  secondaryState: string;

  @Column('int', {

  })
  tagProductTotalCost: number;

  @Column('int', {

  })
  samplePrice: number;
  
  @Column('int', {

  })
  tagMarkingTotalCost: number;

  @Column('int', {

  })
  transportCost: number;
  
  @Column('int', {

  })
  realTransportCost: number;
  
  @Column('int', {

  })
  realMarkingCost: number;
  
  @Column('int', {

  })
  otherRealCosts: number;

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
  @OneToOne(() => OrderRating, (orderRating) => orderRating.orderListDetail)
  @JoinColumn()
  orderRating: OrderRating;

  @OneToOne(() => CartQuote, (cartQuote) => cartQuote.orderListDetail)
  cartQuote: CartQuote;

  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.orderListDetails)
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => MarkingService, (markingService) => markingService.orderListDetails)
  markingService: MarkingService;

  @ManyToOne(() => TransportService, (transportService) => transportService.orderListDetails)
  transportService: TransportService;

  @ManyToOne(() => State, (state) => state.orderListDetails)
  state: State;

  @ManyToOne(() => Product, (product) => product.orderListDetails)
  product: Product;
}