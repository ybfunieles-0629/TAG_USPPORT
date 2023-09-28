import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('admin_users')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  adminType: string;

  @Column('varchar', {

  })
  adminDesc: string;

  @Column('varchar', {

  })
  idClientBoss: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @OneToOne(() => User, (user) => user.admin)
  user: User;
}