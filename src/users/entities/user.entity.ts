import { Access } from 'src/access/entities/access.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  picture: string;

  @Column('varchar', {

  })
  companyPosition: string;

  @Column('varchar', {
    unique: true,
  })
  dni: string;

  @Column('varchar', {

  })
  country: string;

  @Column('varchar', {

  })
  city: string;

  @Column('varchar', {

  })
  address: string;

  @Column('varchar', {
    unique: true,
  })
  email: string;

  @Column('int', {
    unique: true,
  })
  phone: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- Foreign Keys --- *//
  @OneToOne(
    () => Access,
    (access) => access.user, {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  access: Access;

  @ManyToOne(
    () => Company,
    (company) => company.user
  )
  company: Company;

  @ManyToOne(
    () => Role,
    (role) => role.user
  )
  role: Role;
}
