import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Color } from '../../colors/entities/color.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Marking } from '../../markings/entities/marking.entity';
import { Packing } from '../../packings/entities/packing.entity';
import { VariantReference } from '../../variant-reference/entities/variant-reference.entity';
import { TagDisccountPrice } from '../../tag-disccount-prices/entities/tag-disccount-price.entity';
import { Disccount } from '../../disccount/entities/disccount.entity';
import { DeliveryTime } from '../../delivery-times/entities/delivery-time.entity';
import { DiscountQuantity } from '../../discount-quantities/entities/discount-quantity.entity';
import { SupplierPrice } from '../../supplier-prices/entities/supplier-price.entity';

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

  @Column('int', {

  })
  iva: number;

  @Column('int', {

  })
  freeSample: number;

  @Column('int', {

  })
  requiredSample: number;

  @Column('int', {

  })
  loanSample: number;

  @Column('int', {

  })
  refundSampleTime: number;

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

  @Column('date', {

  })
  lastPriceUpdateDate: Date;

  @Column('float', {

  })
  referencePrice: number;

  @Column('varchar', {

  })
  tariffItem: string;

  @Column('varchar', {

  })
  importedNational: string;

  @Column('varchar', {

  })
  marketDesignArea: string;

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
  colors?: Color[];

  @OneToMany(() => Packing, (packing) => packing.product)
  packings?: Packing[];

  @OneToMany(() => Disccount, (disccount) => disccount.product)
  disccounts?: Disccount[];

  @OneToMany(() => DeliveryTime, (deliveryTime) => deliveryTime.product)
  deliveryTimes?: DeliveryTime[];

  @OneToMany(() => SupplierPrice, (supplierPrice) => supplierPrice.product)
  supplierPrices?: SupplierPrice[];

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

  @ManyToMany(() => VariantReference, (variantReference) => variantReference.products)
  @JoinTable({
    name: 'products_has_variant_references',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'variantReference',
      referencedColumnName: 'id',
    },
  })
  variantReferences?: VariantReference[];

  @ManyToMany(() => VariantReference, (variantReference) => variantReference.products)
  @JoinTable({
    name: 'products_has_tag_disccount_prices',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagDisccountPriceId',
      referencedColumnName: 'id',
    },
  })
  tagDisccountPrices?: TagDisccountPrice[];

  @ManyToMany(() => DiscountQuantity, (discountQuantity) => discountQuantity.products)
  @JoinTable({
    name: 'products_has_tag_disccount_prices',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'discountQuantityId',
      referencedColumnName: 'id',
    },
  })
  discountQuantities?: DiscountQuantity[];
}