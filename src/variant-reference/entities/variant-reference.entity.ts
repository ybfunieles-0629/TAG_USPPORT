import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefProduct } from '../../ref-products/entities/ref-product.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => RefProduct, (refProduct) => refProduct.variantReferences)
  refProduct: RefProduct;
}