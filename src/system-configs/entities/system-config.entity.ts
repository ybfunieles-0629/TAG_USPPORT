import { FinancingCostProfit } from 'src/financing-cost-profits/entities/financing-cost-profit.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float', {

  })
  generalDeliveryTime: number;
  
  @Column('float', {

  })
  unforeseenFee: number;

  @Column('float', {

  })
  salesGoal: number;

  @Column('float', {

  })
  noCorporativeClientsMargin: number;

  @Column('float', {

  })
  importationFee: number;

  @Column('float', {
    
  })
  withholdingAtSource: number;

  @Column('float', {

  })
  supplierFinancingPercentage: number;

  @Column('float', {

  })
  marginForDialingServices: number;

  @Column('float', {

  })
  marginForTransportServices: number;

  @Column('float', {

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