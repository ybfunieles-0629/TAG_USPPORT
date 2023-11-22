import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkingServiceDto } from './dto/create-marking-service.dto';
import { UpdateMarkingServiceDto } from './dto/update-marking-service.dto';
import { MarkingService } from './entities/marking-service.entity';
import { Marking } from '../markings/entities/marking.entity';
import { ExternalSubTechnique } from '../external-sub-techniques/entities/external-sub-technique.entity';
import { QuoteDetail } from '../quote-details/entities/quote-detail.entity';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MarkingServicesService {
  constructor(
    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,

    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,

    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,
  ) { }

  async create(createMarkingServiceDto: CreateMarkingServiceDto) {
    const newMarkingService = plainToClass(MarkingService, createMarkingServiceDto);

    const marking = await this.markingRepository.findOne({
      where: {
        id: createMarkingServiceDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${createMarkingServiceDto.marking} not found`);

    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id: createMarkingServiceDto.externalSubTechnique,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${createMarkingServiceDto.externalSubTechnique} not found`);

    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id: createMarkingServiceDto.markingServiceProperty,
      },
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${createMarkingServiceDto.markingServiceProperty} not found`);

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id: createMarkingServiceDto.quoteDetail,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${createMarkingServiceDto.quoteDetail} not found`);

    newMarkingService.marking = marking;
    newMarkingService.externalSubTechnique = externalSubTechnique;
    newMarkingService.markingServiceProperty = markingServiceProperty;
    newMarkingService.quoteDetail = quoteDetail;

    await this.markingRepository.save(newMarkingService);

    return {
      newMarkingService
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.markingServiceRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: MarkingService[] = await this.markingServiceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'marking',
        'markingServiceProperty',
        'externalSubTechnique',
        'quoteDetail',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const markingService = await this.markingServiceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'marking',
        'markingServiceProperty',
        'externalSubTechnique',
        'quoteDetail',
      ],
    });

    if (!markingService)
      throw new NotFoundException(`Marking service with id ${id} not found`);

    return {
      markingService
    };
  }

  async update(id: string, updateMarkingServiceDto: UpdateMarkingServiceDto) {
    const markingService = await this.markingServiceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'marking',
        'markingServiceProperty',
        'externalSubTechnique',
        'quoteDetail',
      ],
    });

    if (!markingService)
      throw new NotFoundException(`Marking service with id ${id} not found`);
    
    const marking = await this.markingRepository.findOne({
      where: {
        id: updateMarkingServiceDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${updateMarkingServiceDto.marking} not found`);

    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id: updateMarkingServiceDto.externalSubTechnique,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${updateMarkingServiceDto.externalSubTechnique} not found`);

    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id: updateMarkingServiceDto.markingServiceProperty,
      },
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${updateMarkingServiceDto.markingServiceProperty} not found`);

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id: updateMarkingServiceDto.quoteDetail,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${updateMarkingServiceDto.quoteDetail} not found`);
  }

  async desactivate(id: string) {
    const { markingService } = await this.findOne(id);

    markingService.isActive = !markingService.isActive;

    await this.markingServiceRepository.save(markingService);

    return {
      markingService
    };
  }

  async remove(id: string) {
    const { markingService } = await this.findOne(id);

    await this.markingServiceRepository.remove(markingService);

    return {
      markingService
    };
  }
}
