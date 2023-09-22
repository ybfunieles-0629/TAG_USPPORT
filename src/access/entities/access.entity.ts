import { Client } from '../../clients/entities/client.entity';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('access')
export class Access {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('varchar', {
    nullable: false,
  })
  password: string;

  //* --- FK --- *//
  @OneToOne(
    () => User,
    (user) => user.access, {
      onDelete: 'CASCADE',
    },
  )
  user: User;

  @OneToOne(
    () => Client,
    (client) => client.access, {
      onDelete: 'CASCADE',
    },
  )
  client: Client;

  @ManyToMany(() => Role, (role) => role.accesses)
  @JoinTable({
    name: 'role_access',
    joinColumn: {
      name: 'accessId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles?: Role[];
}