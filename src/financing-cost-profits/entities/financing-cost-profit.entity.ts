import { SystemConfig } from 'src/system-configs/entities/system-config.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('financing_cost_profits')
export class FinancingCostProfit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @ManyToOne(() => SystemConfig, (systemConfig) => systemConfig.financingCostProfits)
  systemConfig: SystemConfig;
}