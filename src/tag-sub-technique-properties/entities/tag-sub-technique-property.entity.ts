import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { TagSubTechnique } from '../../tag-sub-techniques/entities/tag-sub-technique.entity';

@Entity('tag_sub_technique_properties')
export class TagSubTechniqueProperty {
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
  @OneToOne(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.tagSubTechniqueProperty)
  @JoinColumn()
  markingServiceProperty: MarkingServiceProperty;

  @ManyToOne(() => TagSubTechnique, (tagSubTechnique) => tagSubTechnique.tagSubTechniqueProperties)
  tagSubTechnique: TagSubTechnique;
}