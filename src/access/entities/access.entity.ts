// import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// import { Client } from '../../clients/entities/client.entity';
// import { Role } from '../../roles/entities/role.entity';
// import { User } from '../../users/entities/user.entity';
// import { Permission } from '../../permissions/entities/permission.entity';
// import { Privilege } from '../../privileges/entities/privilege.entity';
// import { Company } from '../../companies/entities/company.entity';
// import { Brand } from '../../brands/entities/brand.entity';

// @Entity('access')
// export class Access {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column('varchar', {
//     unique: true,
//     nullable: false,
//   })
//   email: string;

//   @Column('varchar', {
//     nullable: false,
//   })
//   password: string;

//   //* --- FK --- *//
//   @OneToOne(
//     () => User,
//     (user) => user.access, {
//       onDelete: 'CASCADE',
//     },
//   )
//   user: User;

//   @OneToOne(
//     () => Client,
//     (client) => client.access, {
//       onDelete: 'CASCADE',
//     },
//   )
//   client: Client;

//   @OneToMany(() => Brand, brand => brand.access)
//   brands: Brand[];

//   @ManyToOne(() => Company, (company) => company.access)
//   company: Company;

 
// }