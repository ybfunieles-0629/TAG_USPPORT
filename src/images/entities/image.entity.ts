import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  file: string;

  @Column('varchar', {

  })
  fileMd: string;

  @Column('varchar', {

  })
  fileSm: string;

  @Column('varchar', {

  })
  originalName: string;

  @Column('varchar', {

  })
  orderCode: string;

  @Column('int', {

  })
  materialType: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK ---*//
  // Product FK
}