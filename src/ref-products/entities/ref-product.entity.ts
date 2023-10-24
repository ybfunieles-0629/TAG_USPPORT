import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Image } from '../../images/entities/image.entity';
import { VariantReference } from '../../variant-reference/entities/variant-reference.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { CategorySupplier } from '../../category-suppliers/entities/category-supplier.entity';
import { Marking } from '../../markings/entities/marking.entity';
import { DeliveryTime } from '../../delivery-times/entities/delivery-time.entity';
import { Packing } from 'src/packings/entities/packing.entity';

@Entity('ref_products')
export class RefProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('int', {

  })
  disccountPromo: number;

  @Column('varchar', {

  })
  referenceCode: string;

  @Column('varchar', {

  })
  referenceTagCode: string;

  @Column('varchar', {

  })
  shortDescription: string;

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

  @ManyToMany(() => Marking, (marking) => marking.refProducts)
  @JoinTable({
    name: 'ref_products_has_markings',
    joinColumn: {
      name: 'refProductId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'markingId',
      referencedColumnName: 'id',
    },
  })
  markings?: Marking[];

  @OneToMany(() => DeliveryTime, (deliveryTime) => deliveryTime.refProduct)
  deliveryTimes?: DeliveryTime[];
}