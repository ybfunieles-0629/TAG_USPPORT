import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class DeliveryTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('int', {
    
  })
  minimun: number;

  @Column('int', {

  })
  maximun: number;

  @Column('int', {

  })
  timeInDays: number;

  @Column('int', {

  })
  minimunAdvanceValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}