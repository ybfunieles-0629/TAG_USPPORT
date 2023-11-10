import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkedServicePrice } from '../../marked-service-prices/entities/marked-service-price.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';
import { TagSubTechniqueProperty } from '../../tag-sub-technique-properties/entities/tag-sub-technique-property.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Image } from 'src/images/entities/image.entity';

@Entity('marking_service_properties')
export class MarkingServiceProperty {
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
  technicalPropertyTagService: string;

  @Column('varchar', {

  })
  technicalSubTagProperty: string;

  @Column('varchar', {

  })
  property: string;

  @Column('int', {

  })
  large: number;

  @Column('int', {

  })
  width: number;

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
  @OneToMany(() => Image, (image) => image.markingServiceProperty)
  images: Image[];

  @OneToOne(() => TagSubTechniqueProperty, (tagSubTechniqueProperty) => tagSubTechniqueProperty.markingServiceProperty)
  tagSubTechniqueProperty: TagSubTechniqueProperty;

  @OneToOne(() => MarkingService, (markingService) => markingService.markingServiceProperty)
  markingService: MarkingService;

  @ManyToMany(() => RefProduct, (refProduct) => refProduct.markingServiceProperties)
  refProducts?: RefProduct[];

  @ManyToOne(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.markingServiceProperties)
  externalSubTechnique: ExternalSubTechnique;

  @OneToMany(() => MarkedServicePrice, (markedServicePrice) => markedServicePrice.markingServiceProperty)
  markedServicePrices?: MarkedServicePrice[];
}