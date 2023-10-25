import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Marking } from '../../markings/entities/marking.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';
import { Logo } from '../../logos/entities/logo.entity';

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
  @OneToOne(() => Marking, (marking) => marking.markingService)
  @JoinTable()
  marking: Marking;

  @OneToOne(() =>  MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.markingService)
  @JoinTable()
  markingServiceProperty: MarkingServiceProperty;

  @OneToOne(() =>  ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.markingService)
  @JoinTable()
  externalSubTechnique: ExternalSubTechnique;

  @OneToMany(() => Logo, (logo) => logo.markingService)
  logos?: Logo[];

  @ManyToOne(() => QuoteDetail, (quoteDetail) => quoteDetail.markingServices)
  quoteDetail: QuoteDetail;
}