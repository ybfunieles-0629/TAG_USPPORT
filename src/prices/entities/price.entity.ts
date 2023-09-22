import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  
}