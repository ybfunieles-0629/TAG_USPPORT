import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CategoryTag } from '../../category-tag/entities/category-tag.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';

@Entity('category_suppliers')
export class CategorySupplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  offspringType: string;

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

  @Column('varchar', {

  })
  apiReferenceId: string;

  @Column('varchar', {

  })
  origin: string;

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
  @ManyToOne(() => CategoryTag, (categoryTag) => categoryTag.categorySuppliers)
  categoryTag: CategoryTag;
  
  @ManyToOne(() => Supplier, (supplier) => supplier.categorySuppliers)
  supplier: Supplier;

  @ManyToMany(() => RefProduct, (refProduct) => refProduct.categorySuppliers)
  refProducts?: RefProduct[];
}