import { Disccount } from 'src/disccount/entities/disccount.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Disccounts')
export class Disccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {

  })
  minQuantity: number;

  @Column('int', {

  })
  maxQuantity: number;

  @Column('int', {

  })
  nextMinValue: number;

  @Column('int', {

  })
  disccountValue: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  //* ---- FK ---- *//
  @ManyToOne(() => Disccount, (disccount) => disccount.disccounts)
  disccount: Disccount;
}