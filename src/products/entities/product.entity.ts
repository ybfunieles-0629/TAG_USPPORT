import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  description: string;

  // TODO: SLUG
  // slug

  @Column('varchar', {

  })
  productionCompany: string;

  @Column('varchar', {

  })
  supplierSku: string;

  @Column('varchar', {

  })
  tagSku: string;

  @Column('varchar', {

  })
  color: string;

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
  designArea: string;

  @Column('varchar', {

  })
  areasList: string;

  @Column('float', {

  })
  weight: number;
  
  @Column('int', {

  })
  availableUni: number;

  @Column('int', {

  })
  transitUni: number;

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
  refundTime: number;

  @Column('float', {

  })
  samplePrice: number;

  @Column('bool', {

  })
  importedNational: boolean;

  @Column('int', {

  })
  iva: number;

  @Column('float', {

  })
  tagDisccount: number;

  @Column('float', {

  })
  netPrice: number;

  @Column('int', {

  })
  minQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  // @Column('varchar', {

  // })
  // images: string;

  // PRICES FK
}