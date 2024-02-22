import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { State } from '../../states/entities/state.entity';
import { User } from '../../users/entities/user.entity';

@Entity('status_histories')
export class StatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  processId: string;

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
  @ManyToOne(() => User, (user) => user.statusHistories)
  user: User;

  @ManyToOne(() => State, (state) => state.statusHistories)
  state: State;
}