import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Client } from '../../clients/entities/client.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => Client, (client) => client.addresses)
  client: Client;
}
