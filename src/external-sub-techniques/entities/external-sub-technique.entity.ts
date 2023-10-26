import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Marking } from '../../markings/entities/marking.entity';
import { TagSubTechnique } from '../../tag-sub-techniques/entities/tag-sub-technique.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';

@Entity('external_sub_techniques')
export class ExternalSubTechnique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

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
  @OneToOne(() => Supplier, (supplier) => supplier.externalSubTechnique)
  @JoinTable()
  supplier: Supplier;

  @OneToOne(() => MarkingService, (markingService) => markingService.externalSubTechnique)
  markingService: MarkingService;

  @OneToOne(() => TagSubTechnique, (tagSubTechnique) => tagSubTechnique.externalSubTechnique)
  tagSubTechnique: TagSubTechnique;

  @OneToMany(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.externalSubTechnique)
  markingServiceProperties?: MarkingServiceProperty[];

  @ManyToOne(() => Marking, (marking) => marking.externalSubTechniques)
  marking: Marking;
}