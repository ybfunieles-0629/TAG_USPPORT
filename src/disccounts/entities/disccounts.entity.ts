import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Disccount } from '../../disccount/entities/disccount.entity';

@Entity('disccounts')
export class Disccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  minQuantity: number;

  @Column('int', {

  })
  maxQuantity: number;

  @Column('int', {

  })
  nextMinValue: number;

  @Column('int', {

  })
  disccountValue: number;

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
  @ManyToOne(() => Disccount, (disccount) => disccount.disccounts)
  disccount: Disccount;
}