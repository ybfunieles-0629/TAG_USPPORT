import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Image } from '../../images/entities/image.entity';
import { VariantReference } from '../../variant-reference/entities/variant-reference.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { CategorySupplier } from '../../category-suppliers/entities/category-supplier.entity';
import { Marking } from '../../markings/entities/marking.entity';
import { DeliveryTime } from '../../delivery-times/entities/delivery-time.entity';
import { Packing } from '../../packings/entities/packing.entity';
import { MarkingServiceProperty } from '../../marking-service-properties/entities/marking-service-property.entity';

@Entity('ref_products')
export class RefProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  referenceCode: string;

  @Column('varchar', {

  })
  referenceTagCode: string;

  @Column('varchar', {

  })
  shortDescription: string;

  @Column('int', {
    default: 1,
  })
  isAllowed: number;

  @Column('varchar', {

  })
  description: string;

  @Column('varchar', {

  })
  mainCategory: string;

  @Column('varchar', {

  })
  keywords: string;

  @Column('int', {

  })
  personalizableMarking: number;

  @Column('float', {

  })
  large: number;

  @Column('float', {

  })
  width: number;

  @Column('float', {

  })
  height: number;

  @Column('int', {

  })
  volume: number;

  @Column('varchar', {

  })
  markedDesignArea: string;

  @Column('float', {

  })
  weight: number;

  @Column('int', {

  })
  minQuantity: number;

  @Column('int', {

  })
  productInventoryLeadTime: number;

  @Column('int', {

  })
  productNoInventoryLeadTime: number;

  @Column('int', {

  })
  productOnDemand: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  //* --- FK --- *//
  @OneToMany(() => Product, (product) => product.refProduct)
  products?: Product[];

  @OneToMany(() => Packing, (packing) => packing.refProduct)
  packings?: Packing[];

  @OneToMany(() => Image, (image) => image.refProduct)
  images?: Image[];

  @OneToMany(() => VariantReference, (variantReference) => variantReference.refProduct)
  variantReferences: VariantReference[];

  @ManyToOne(() => Supplier, (supplier) => supplier.refProducts)
  supplier: Supplier;

  @ManyToOne(() => MarkingServiceProperty, (markingServiceProperty) => markingServiceProperty.refProducts)
  markingServiceProperty: MarkingServiceProperty;

  @ManyToMany(() => CategorySupplier, (categorySupplier) => categorySupplier.refProducts)
  @JoinTable({
    name: 'ref_products_has_category_suppliers',
    joinColumn: {
      name: 'refProductId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'categorySupplierId',
      referencedColumnName: 'id',
    },
  })
  categorySuppliers?: CategorySupplier[];

  @ManyToMany(() => DeliveryTime, (deliveryTime) => deliveryTime.refProducts)
  @JoinTable({
    name: 'ref_products_has_delivery_times',
    joinColumn: {
      name: 'refProductId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'deliveryTimeId',
      referencedColumnName: 'id',
    },
  })
  deliveryTimes?: DeliveryTime[];
}