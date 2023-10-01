import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  fee: string;

  @Column('varchar', {

  })
  companyId: string;

  @Column('varchar', {

  })
  secondaryUserId: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => User, (user) => user.brands)
  user: User;
}