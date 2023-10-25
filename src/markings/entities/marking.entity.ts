import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

import { MarkingTagService } from '../../marking-tag-services/entities/marking-tag-service.entity';
import { Company } from '../../companies/entities/company.entity';
import { Product } from '../../products/entities/product.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';
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

  @Column('varchar', {

  })
  markingTechnique: string;

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
  @OneToOne(() => MarkingTagService, (markingTagService) => markingTagService.marking)
  @JoinColumn()
  markingTagService: MarkingTagService;

  @OneToOne(() => MarkingService, (markingService) => markingService.marking)
  @JoinColumn()
  markingService: MarkingService;

  @OneToMany(() => ExternalSubTechnique, (externalSubTechnique) => externalSubTechnique.marking)
  externalSubTechniques?: ExternalSubTechnique[];

  @ManyToOne(() => Company, (company) => company.markings)
  company: Company;
}