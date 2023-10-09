import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CategorySupplier } from '../../category-suppliers/entities/category-supplier.entity';

@Entity('category_tag')
export class CategoryTag {
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

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => CategorySupplier, (categorySupplier) => categorySupplier.categoryTag)
  categorySuppliers: CategorySupplier[];
}