import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../../markings/entities/marking.entity';

@Entity('marked_service_prices')
export class MarkedServicePrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {
    
  })
  minRange: number;

  @Column('int', {
    
  })
  maxRange: number;

  @Column('float', {
    
  })
  unitPrice: number;

  @Column('int')
  deliveryTime: number;

  @Column('boolean', {

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

  //* --- FK --- *//
  @ManyToOne(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.markedServicePrices)
  markingServiceProperty: MarkingServiceProperty;
}