import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Color } from '../../colors/entities/color.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
import { Packing } from '../../packings/entities/packing.entity';
import { VariantReference } from '../../variant-reference/entities/variant-reference.entity';
import { TagDisccountPrice } from '../../tag-disccount-prices/entities/tag-disccount-price.entity';
import { Disccount } from '../../disccount/entities/disccount.entity';
import { DeliveryTime } from '../../delivery-times/entities/delivery-time.entity';
import { DiscountQuantity } from '../../discount-quantities/entities/discount-quantity.entity';
import { SupplierPrice } from '../../supplier-prices/entities/supplier-price.entity';
import { QuoteDetail } from '../../quote-details/entities/quote-detail.entity';
import { OrderListDetail } from '../../order-list-details/entities/order-list-detail.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';
import { Image } from '../../images/entities/image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  disccountPromo: number;

  @Column('int', {
    default: 1,
  })
  isAllowed: number;

  @Column('varchar', {

  })
  supplierSku: string;

  @Column('varchar', {
    unique: true,
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
  volume: number;

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
  rejectionReason: string;

  @Column('int', {

  })
  registeredNewOrUpdated: number;

  @Column('varchar', {

  })
  updateReason: string;

  @Column('varchar', {

  })
  markedDesignArea: string;

  @Column('int', {

  })
  unforeseenFee: number;

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

  @OneToMany(() => QuoteDetail, (quoteDetail) => quoteDetail.product)
  quoteDetails?: QuoteDetail[];

  @OneToMany(() => OrderListDetail, (orderListDetail) => orderListDetail.product)
  orderListDetails: OrderListDetail[];

  @OneToMany(() => Image, (image) => image.product)
  images?: Image[];

  @ManyToOne(() => RefProduct, (refProduct) => refProduct.products)
  refProduct: RefProduct;

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

  @ManyToMany(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.products)
  @JoinTable({
    name: 'products_has_marking_service_properties',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'markingServicePropertyId',
      referencedColumnName: 'id',
    },
  })
  markingServiceProperties?: MarkingServiceProperty[];

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