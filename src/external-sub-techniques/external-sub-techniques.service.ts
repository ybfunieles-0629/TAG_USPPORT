import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateExternalSubTechniqueDto } from './dto/create-external-sub-technique.dto';
import { UpdateExternalSubTechniqueDto } from './dto/update-external-sub-technique.dto';
import { ExternalSubTechnique } from './entities/external-sub-technique.entity';
import { Marking } from '../markings/entities/marking.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExternalSubTechniquesService {
  constructor(
    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,

    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) { }

  async create(createExternalSubTechniqueDto: CreateExternalSubTechniqueDto) {
    const newExternalSubTechnique = plainToClass(ExternalSubTechnique, createExternalSubTechniqueDto);

    const marking = await this.markingRepository.findOne({
      where: {
        id: createExternalSubTechniqueDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${createExternalSubTechniqueDto.marking} not found`);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createExternalSubTechniqueDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${createExternalSubTechniqueDto.supplier} not found`);

    newExternalSubTechnique.marking = marking;
    newExternalSubTechnique.supplier = supplier;

    await this.externalSubTechniqueRepository.save(newExternalSubTechnique);

    return {
      newExternalSubTechnique
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.externalSubTechniqueRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'marking',
        'supplier',
      ],
    });
  }

  async findOne(id: string) {
    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id,
      },
      relations: [
        'marking',
        'supplier',
      ],
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${id} not found`);

    return {
      externalSubTechnique
    };
  }

  async update(id: string, updateExternalSubTechniqueDto: UpdateExternalSubTechniqueDto) {
    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${id} not found`);

    const updatedExternalSubTechnique = plainToClass(ExternalSubTechnique, updateExternalSubTechniqueDto);

    const marking = await this.markingRepository.findOne({
      where: {
        id: updateExternalSubTechniqueDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${updateExternalSubTechniqueDto.marking} not found`);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: updateExternalSubTechniqueDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${updateExternalSubTechniqueDto.supplier} not found`);

    updatedExternalSubTechnique.marking = marking;
    updatedExternalSubTechnique.supplier = supplier;

    Object.assign(externalSubTechnique, updatedExternalSubTechnique);

    await this.externalSubTechniqueRepository.save(externalSubTechnique);

    return {
      externalSubTechnique
    };
  }

  async desactivate(id: string) {
    const { externalSubTechnique } = await this.findOne(id);

    externalSubTechnique.isActive = !externalSubTechnique.isActive;

    await this.externalSubTechniqueRepository.save(externalSubTechnique);

    return {
      externalSubTechnique
    };
  }

  async remove(id: string) {
    const { externalSubTechnique } = await this.findOne(id);

    await this.externalSubTechniqueRepository.remove(externalSubTechnique);

    return {
      externalSubTechnique
    };
  }
}
