import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

import { LocalTransportPrice } from '../../local-transport-prices/entities/local-transport-price.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { Company } from '../../companies/entities/company.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';

@Entity('transport_services')
export class TransportService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  api: number;

  @Column('int', {

  })
  insurance: number;

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
  @OneToMany(() => LocalTransportPrice, (localTransportPrice) => localTransportPrice.transportService)
  localTransportPrices: LocalTransportPrice[];

  @OneToMany(() => OrderListDetail, (orderListDetail) => orderListDetail.transportService)
  orderListDetails: OrderListDetail[];

  @ManyToOne(() => QuoteDetail, (quoteDetail) => quoteDetail.transportServices)
  quoteDetail: QuoteDetail;

  @ManyToOne(() => Company, (company) => company.transportServices)
  company: Company;
}