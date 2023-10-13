import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkedServicePrice } from '../../marked-service-prices/entities/marked-service-price.entity';
import { MarkingTagService } from '../../marking-tag-services/entities/marking-tag-service.entity';
import { Company } from '../../companies/entities/company.entity';
import { Product } from '../../products/entities/product.entity';
import { RefProduct } from '../../ref-products/entities/ref-product.entity';

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
  @OneToMany(() => MarkedServicePrice, (markedServicePrice) => markedServicePrice.marking)
  markedServicePrices?: MarkedServicePrice[];

  @OneToMany(() => MarkingTagService, (markingTagService) => markingTagService.markings)
  markingTagService: MarkingTagService;

  @ManyToOne(() => Company, (company) => company.markings)
  company: Company;

  @ManyToMany(() => Product, (product) => product.markings)
  products?: Product[];

  @ManyToMany(() => RefProduct, (refProduct) => refProduct.markings)
  refProducts?: RefProduct[];
}