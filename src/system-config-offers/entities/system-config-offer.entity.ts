import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('system_config_offers')
export class SystemConfigOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  offerPercentage: number;

  @Column('date', {

  })
  initDate: Date;

  @Column('date', {

  })
  finalDate: Date;

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

  //* ----- FK ----- *//
  @ManyToOne(() => Product, (product) => product.systemConfigOffers)
  product: Product;
}