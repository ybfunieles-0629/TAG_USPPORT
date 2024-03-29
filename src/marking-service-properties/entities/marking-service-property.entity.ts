import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkedServicePrice } from '../../marked-service-prices/entities/marked-service-price.entity';
import { ExternalSubTechnique } from '../../external-sub-techniques/entities/external-sub-technique.entity';
import { TagSubTechniqueProperty } from '../../tag-sub-technique-properties/entities/tag-sub-technique-property.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Image } from '../../images/entities/image.entity';
import { Product } from '../../products/entities/product.entity';

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
  @OneToOne(() => TagSubTechniqueProperty, (tagSubTechniqueProperty) => tagSubTechniqueProperty.markingServiceProperty)
  tagSubTechniqueProperty: TagSubTechniqueProperty;

  @OneToMany(() => MarkingService, (markingService) => markingService.markingServiceProperty)
  markingServices: MarkingService[];

  @OneToMany(() => MarkedServicePrice, (markedServicePrice) => markedServicePrice.markingServiceProperty)
  markedServicePrices?: MarkedServicePrice[];

  @OneToMany(() => Image, (image) => image.markingServiceProperty)
  images: Image[];

  @ManyToOne(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.markingServiceProperties)
  externalSubTechnique: ExternalSubTechnique;

  @OneToMany(() => RefProduct, (refProduct) => refProduct.markingServiceProperty)
  refProducts?: RefProduct[];

  @ManyToMany(() => Product, (product) => product.markingServiceProperties)
  products?: Product[];
}