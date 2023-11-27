import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { TagSubTechniqueProperty } from '../../tag-sub-technique-properties/entities/tag-sub-technique-property.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    unique: true,
  })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK ---*//
  @ManyToOne(() => TagSubTechniqueProperty, (tagSubTechniqueProperty) => tagSubTechniqueProperty.images)
  tagSubTechniqueProperty: TagSubTechniqueProperty;

  @ManyToOne(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.images)
  markingServiceProperty: MarkingServiceProperty;

  @ManyToOne(() => RefProduct, (refProduct) => refProduct.images)
  refProduct: RefProduct;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}