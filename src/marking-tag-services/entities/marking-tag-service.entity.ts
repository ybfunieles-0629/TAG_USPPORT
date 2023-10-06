import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from 'src/markings/entities/marking.entity';

@Entity('marking_tag_services')
export class MarkingTagService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {
    
  })
  description: string;

  @Column('varchar', {
    
  })
  markingTechnique: string;

  @Column('varchar', {
    
  })
  subMarkingTechnique: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  udpatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.markingTagService)
  markingServiceProperties: MarkingServiceProperty[];

  @ManyToOne(() => Marking, (marking) => marking.markingTagService)
  markings: Marking[];
}