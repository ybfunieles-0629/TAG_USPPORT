import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ListPrice } from '../../list-prices/entities/list-price.entity';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('supplier_prices')
export class SupplierPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //* ---- FK ---- *//
  @OneToMany(() => ListPrice, (listPrice) => listPrice.supplierPrice)
  listPrices?: ListPrice[];

  @ManyToOne(() => Product, (product) => product.supplierPrices)
  product: Product;

  @ManyToOne(() => Supplier, (supplier) => supplier.supplierPrices)
  supplier: Supplier;
}