import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CategorySupplier } from '../../category-suppliers/entities/category-supplier.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';

@Entity('category_tag')
export class CategoryTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  offspringType: string;

  @Column('varchar', {

  })
  icon: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  description: string;

  @Column('varchar', {

  })
  categoryMargin: string;

  @Column('int', {

  })
  featured: number;

  @Column('varchar', {

  })
  image: string;

  @Column('varchar', {

  })
  mainCategory: string;

  @Column('varchar', {

  })
  parentCategory: string;

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

  //* --- FK --- *//
  @OneToMany(() => CategorySupplier, (categorySupplier) => categorySupplier.categoryTag)
  categorySuppliers: CategorySupplier[];

  @ManyToMany(() => RefProduct, (refProduct) => refProduct.categoryTags)
  refProducts?: RefProduct[];
}