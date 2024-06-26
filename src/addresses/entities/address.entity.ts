import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Client } from '../../clients/entities/client.entity';
import { UpdateSubSupplierProductTypeDto } from '../../sub-supplier-product-types/dto/update-sub-supplier-product-type.dto';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  country: string;

  @Column('varchar', {

  })
  city: string;

  @Column('varchar', {

  })
  address: string;

  @Column('varchar', {

  })
  postalCode: string;

  @Column('varchar', {

  })
  gpsLocation: string;

  @Column('varchar', {

  })
  deliveryAddress: string;

  @Column('varchar', {

  })
  mainAddress: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;


  @Column('int', {
  })
  isPrimary: number;


  @Column('varchar', {

  })
  createdBy: string;

  @Column('varchar', {

  })
  updatedBy: string;


  @Column('varchar', {
    nullable: true, // Esto es opcional dependiendo de tus requisitos
  })
  clientUser: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => Client, (client) => client.addresses)
  client: Client;
}
