import { MarkingService } from 'src/marking-services/entities/marking-service.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    
  })
  logo: string;
  
  @Column('varchar', {
    
  })
  mounting: string;

  @Column('varchar', {

  })
  createdBy: string;

  @Column('varchar', {

  })
  updatedBy: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* ---- FK ---- *//
  @ManyToOne(() => MarkingService, (markingService) => markingService.logos)
  markingService: MarkingService;
}