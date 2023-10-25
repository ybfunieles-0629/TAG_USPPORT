import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../../markings/entities/marking.entity';

@Entity('marked_service_prices')
export class MarkedServicePrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  markedServiceTagTechnique: string;

  @Column('varchar', {
    
  })
  subTechnique: string;

  @Column('varchar', {
    
  })
  markedServiceSubTagTechnique: string;

  @Column('int', {
    
  })
  minRange: number;

  @Column('int', {
    
  })
  maxRange: number;

  @Column('int', {
    
  })
  maxLarge: number;

  @Column('int', {
    
  })
  maxWidth: number;

  @Column('varchar', {
    
  })
  property: string;

  @Column('float', {
    
  })
  unitPrice: number;

  @Column('date')
  deliveryTime: Date;

  @Column('boolean', {

  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.markedServicePrices)
  markingServiceProperty: MarkingServiceProperty;
}