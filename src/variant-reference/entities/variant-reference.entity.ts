import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('variant_reference')
export class VariantReference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  variableValue: string;

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
  @ManyToOne(() => RefProduct, (refProduct) => refProduct.variantReferences)
  refProduct: RefProduct;

  @ManyToMany(() => Product, (product) => product.variantReferences)
  products?: Product[];
}