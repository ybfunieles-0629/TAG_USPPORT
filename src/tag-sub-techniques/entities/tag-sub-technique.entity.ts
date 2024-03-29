import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingTagService } from '../../marking-tag-services/entities/marking-tag-service.entity';
import { TagSubTechniqueProperty } from '../../tag-sub-technique-properties/entities/tag-sub-technique-property.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';

@Entity('tag_sub_techniques')
export class TagSubTechnique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  description: string;

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
  @OneToOne(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.tagSubTechnique)
  @JoinColumn()
  externalSubTechnique: ExternalSubTechnique;

  @OneToMany(() => TagSubTechniqueProperty, (tagSubTechniqueProperty) => tagSubTechniqueProperty.tagSubTechnique)
  tagSubTechniqueProperties?: TagSubTechniqueProperty[];

  @ManyToOne(() => MarkingTagService, (markingTagService) => markingTagService.tagSubTechniques)
  markingTagService: MarkingTagService;
}