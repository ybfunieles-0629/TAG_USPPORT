import { FinancingCostProfit } from 'src/financing-cost-profits/entities/financing-cost-profit.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  generalDeliveryTime: number;

  @Column('int', {

  })
  noCorporativeClientsMargin: number;

  @Column('int', {

  })
  importationFee: number;

  @Column('int', {
    
  })
  withholdingAtSource: number;

  @Column('int', {

  })
  supplierFinancingPercentage: number;

  @Column('int', {

  })
  marginForDialingServices: number;

  @Column('int', {

  })
  marginForTransportServices: number;

  @Column('int', {

  })
  maxDiscount: number;

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

  //* ---- FK ---- *//
  @OneToMany(() => FinancingCostProfit, (financingCostProfit) => financingCostProfit.systemConfig)
  financingCostProfits: FinancingCostProfit;
}