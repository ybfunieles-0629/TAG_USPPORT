import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('swiper_home')
export class SwiperHome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  title: string;

  @Column('varchar', {

  })
  subtitle: string;

  @Column('varchar', {

  })
  imageUrl: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}