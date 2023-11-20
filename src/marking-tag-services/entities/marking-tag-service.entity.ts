import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../../markings/entities/marking.entity';
import { TagSubTechnique } from 'src/tag-sub-techniques/entities/tag-sub-technique.entity';

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
  udpatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => TagSubTechnique, (tagSubTechnique) => tagSubTechnique.markingTagService)
  tagSubTechniques?: TagSubTechnique[];

  @OneToMany(() => Marking, (marking) => marking.markingTagService)
  markings: Marking[];
}