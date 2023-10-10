import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { MarkingTagService } from '../../marking-tag-services/entities/marking-tag-service.entity';
import { MarkedServicePrice } from 'src/marked-service-prices/entities/marked-service-price.entity';

@Entity('marking_service_properties')
export class MarkingServiceProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {

  })
  technicalPropertyTagService: string;

  @Column('varchar', {

  })
  technicalSubTagProperty: string;

  @Column('varchar', {

  })
  property: string;
  
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //* --- FK --- *//
  @ManyToOne(() => MarkingTagService, (markingTagService) => markingTagService.markingServiceProperties)
  markingTagService: MarkingTagService;

  @ManyToOne(() => MarkedServicePrice, (markedServicePrice) => markedServicePrice.markingServiceProperties)
  markedServicePrice: MarkedServicePrice;
}