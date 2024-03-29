import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Marking } from '../../markings/entities/marking.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';
import { Logo } from '../../logos/entities/logo.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';

@Entity('marking_services')
export class MarkingService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  mounting: string;

  @Column('int', {
    
  })
  calculatedMarkingPrice: number;

  @Column('int', {
    
  })
  markingTransportPrice: number;

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
  @ManyToOne(() => Marking, (marking) => marking.markingServices)
  marking: Marking;

  @ManyToOne(() =>  MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.markingServices)
  markingServiceProperty: MarkingServiceProperty;

  @ManyToOne(() =>  ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.markingServices)
  externalSubTechnique: ExternalSubTechnique;

  @ManyToOne(() => OrderListDetail, (orderListDetail) => orderListDetail.markingServices)
  orderListDetail: OrderListDetail;

  @OneToMany(() => Logo, (logo) => logo.markingService)
  logos?: Logo[];

  @ManyToOne(() => QuoteDetail, (quoteDetail) => quoteDetail.markingServices)
  quoteDetail: QuoteDetail;
}