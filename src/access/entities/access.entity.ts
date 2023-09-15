import { Client } from 'src/clients/entities/client.entity';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
    (user) => user.access
  )
  user: User;

  @OneToOne(
    () => Client,
    (client) => client.access
  )
  client: Client;

  @ManyToOne(
    () => Role,
    (role) => role.access
  )
  role: Role;
}