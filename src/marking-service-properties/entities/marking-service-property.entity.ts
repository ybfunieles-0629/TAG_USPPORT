import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkedServicePrice } from '../../marked-service-prices/entities/marked-service-price.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';
import { TagSubTechniqueProperty } from 'src/tag-sub-technique-properties/entities/tag-sub-technique-property.entity';

@Entity('marking_service_properties')
export class MarkingServiceProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  technicalPropertyTagService: string;

  @Column('varchar', {

  })
  technicalSubTagProperty: string;

  @Column('varchar', {

  })
  property: string;

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

  //* --- FK --- *//
  @OneToOne(() => TagSubTechniqueProperty, (tagSubTechniqueProperty) => tagSubTechniqueProperty.markingServiceProperty)
  tagSubTechniqueProperty: TagSubTechniqueProperty;

  @ManyToOne(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.markingServiceProperties)
  externalSubTechnique: ExternalSubTechnique;

  @OneToMany(() => MarkedServicePrice, (markedServicePrice) => markedServicePrice.markingServiceProperty)
  markedServicePrices?: MarkedServicePrice[];
}