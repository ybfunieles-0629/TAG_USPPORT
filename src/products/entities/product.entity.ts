import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Color } from '../../colors/entities/color.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { MarketDesignArea } from '../../market-design-area/entities/market-design-area.entity';
import { Marking } from '../../markings/entities/marking.entity';
import { Packing } from '../../packings/entities/packing.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  supplierSku: string;

  @Column('varchar', {

  })
  tagSku: string;

  @Column('float', {

  })
  large: number;

  @Column('float', {

  })
  width: number;

  @Column('float', {

  })
  height: number;

  @Column('float', {

  })
  weight: number;

  @Column('int', {

  })
  availableUnit: number;

  @Column('int', {

  })
  transitUnit: number;

  @Column('date', {

  })
  productArrivalDate: Date;

  @Column('bool', {

  })
  freeSample: boolean;

  @Column('bool', {

  })
  requiredSample: boolean;

  @Column('bool', {

  })
  loanSample: boolean;

  @Column('int', {

  })
  refundSampleTime: number;

  @Column('int', {

  })
  iva: number;

  @Column('float', {

  })
  tagDisccount: number;

  @Column('float', {

  })
  promoDisccount: number;

  @Column('int', {

  })
  hasNetPrice: number;

  @Column('float', {

  })
  samplePrice: number;

  @Column('float', {

  })
  referencePrice: number;

  @Column('varchar', {

  })
  tariffItem: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToMany(() => Color, (color) => color.product)
  colors: Color[];

  @OneToMany(() => MarketDesignArea, (marketDesignArea) => marketDesignArea.product)
  marketDesignAreas: MarketDesignArea[];

  @OneToMany(() => Packing, (packing) => packing.product)
  packings: Packing[];

  @ManyToOne(() => RefProduct, (refProduct) => refProduct.products)
  refProduct: RefProduct;
  
  @ManyToMany(() => Marking, (marking) => marking.products)
  @JoinTable({
    name: 'products_has_markings',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'markingId',
      referencedColumnName: 'id',
    },
  })
  markings?: Marking[];
}