import { TransportService } from 'src/transport-services/entities/transport-service.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('local_transport_prices')
export class LocalTransportPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  maximumWeight: number;

  @Column('int', {

  })
  maximumLarge: number;

  @Column('int', {

  })
  maximumHeight: number;

  @Column('int', {

  })
  maximumWidth: number;

  @Column('int', {

  })
  volume: number;

  @Column('int', {

  })
  price: number;

  @Column('varchar', {

  })
  origin: string;

  @Column('varchar', {

  })
  destination: string;

  @Column('varchar', {

  })
  vehicleType: string;
  
  @Column('varchar', {

  })
  createdBy: string;

  @Column('varchar', {

  })
  updatedBy: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToOne(() => TransportService, (transportService) => transportService.localTransportPrices)
  transportService: TransportService;
}