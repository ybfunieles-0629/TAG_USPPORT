import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('market_design_area')
export class MarketDesignArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  image: string;

  @Column('int', {

  })
  large: number;

  @Column('varchar', {

  })
  width: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => Product, (product) => product.marketDesignAreas)
  product: Product;
}