import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinTable, JoinColumn, ManyToMany } from 'typeorm';

import { MarkingTagService } from '../../marking-tag-services/entities/marking-tag-service.entity';
import { Company } from '../../companies/entities/company.entity';
import { ExternalSubTechnique } from 'src/external-sub-techniques/entities/external-sub-technique.entity';
import { MarkingService } from '../../marking-services/entities/marking-service.entity';

@Entity('markings')
export class Marking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  name: string;

  @Column('varchar', {

  })
  description: string;

  @Column('int', {

  })
  iva: number;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => MarkingTagService, (markingTagService) => markingTagService.markings)
  markingTagService: MarkingTagService;

  @OneToMany(() => MarkingService, (markingService) => markingService.marking)
  markingServices: MarkingService[];

  @OneToMany(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.marking)
  externalSubTechniques?: ExternalSubTechnique[];

  @ManyToOne(() => Company, (company) => company.markings)
  company: Company;
}