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
import { TagSubTechnique } from '../tag-sub-techniques/entities/tag-sub-technique.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExternalSubTechniquesService {
  constructor(
    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,

    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,

    @InjectRepository(TagSubTechnique)
    private readonly tagSubTechniqueRepository: Repository<TagSubTechnique>,
  ) { }

  async create(createExternalSubTechniqueDto: CreateExternalSubTechniqueDto, user: User) {
    const newExternalSubTechnique = plainToClass(ExternalSubTechnique, createExternalSubTechniqueDto);

    newExternalSubTechnique.createdBy = user.id;

    const marking = await this.markingRepository.findOne({
      where: {
        id: createExternalSubTechniqueDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${createExternalSubTechniqueDto.marking} not found`);

    if (createExternalSubTechniqueDto.tagSubTechnique) {
      const tagSubTechnique = await this.tagSubTechniqueRepository.findOne({
        where: {
          id: createExternalSubTechniqueDto.tagSubTechnique,
        },
      });

      if (!tagSubTechnique)
        throw new NotFoundException(`Tag sub technique with id ${createExternalSubTechniqueDto.tagSubTechnique} not found`);

      newExternalSubTechnique.tagSubTechnique = tagSubTechnique;
    }

    newExternalSubTechnique.marking = marking;

    await this.externalSubTechniqueRepository.save(newExternalSubTechnique);

    return {
      newExternalSubTechnique
    };
  }

  async createMultiple(createExternalSubTechniques: CreateExternalSubTechniqueDto[], user: User) {
    const createdExternalSubTechniques: ExternalSubTechnique[] = [];

    for (const createExternalSubTechniqueDto of createExternalSubTechniques) {
      const newExternalSubTechnique = plainToClass(ExternalSubTechnique, createExternalSubTechniqueDto);

      newExternalSubTechnique.createdBy = user.id;

      const marking = await this.markingRepository.findOne({
        where: {
          id: createExternalSubTechniqueDto.marking,
        },
      });

      if (!marking)
        throw new NotFoundException(`Marking with id ${createExternalSubTechniqueDto.marking} not found`);

      if (createExternalSubTechniqueDto.tagSubTechnique) {
        const tagSubTechnique = await this.tagSubTechniqueRepository.findOne({
          where: {
            id: createExternalSubTechniqueDto.tagSubTechnique,
          },
        });

        if (!tagSubTechnique)
          throw new NotFoundException(`Tag sub technique with id ${createExternalSubTechniqueDto.tagSubTechnique} not found`);

        newExternalSubTechnique.tagSubTechnique = tagSubTechnique;
      }

      newExternalSubTechnique.marking = marking;

      const createdExternalSubTechnique = await this.externalSubTechniqueRepository.save(newExternalSubTechnique);

      createdExternalSubTechniques.push(createdExternalSubTechnique);
    }

    return {
      createdExternalSubTechniques
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.externalSubTechniqueRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'marking',
        'tagSubTechnique',
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
        'tagSubTechnique',
      ],
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`Tag sub technique with id ${id} not found`);

    return {
      externalSubTechnique
    };
  }

  async update(id: string, updateExternalSubTechniqueDto: UpdateExternalSubTechniqueDto, user: User) {
    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${id} not found`);

    const updatedExternalSubTechnique = plainToClass(ExternalSubTechnique, updateExternalSubTechniqueDto);

    updatedExternalSubTechnique.updatedBy = user.id;

    const marking = await this.markingRepository.findOne({
      where: {
        id: updateExternalSubTechniqueDto.marking,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${updateExternalSubTechniqueDto.marking} not found`);

    if (updateExternalSubTechniqueDto.tagSubTechnique) {

      const tagSubTechnique = await this.tagSubTechniqueRepository.findOne({
        where: {
          id: updateExternalSubTechniqueDto.tagSubTechnique,
        },
      });

      if (!tagSubTechnique)
        throw new NotFoundException(`Tag sub technique with id ${updateExternalSubTechniqueDto.tagSubTechnique} not found`);

      updatedExternalSubTechnique.tagSubTechnique = tagSubTechnique;
    }

    updatedExternalSubTechnique.marking = marking;

    Object.assign(externalSubTechnique, updatedExternalSubTechnique);

    await this.externalSubTechniqueRepository.save(externalSubTechnique);

    return {
      externalSubTechnique
    };
  }

  async updateMultiple(updateExternalSubTechniques: UpdateExternalSubTechniqueDto[], user: User) {
    const updatedExternalSubTechniques: ExternalSubTechnique[] = [];

    for (const updateExternalSubTechniqueDto of updateExternalSubTechniques) {

      const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
        where: {
          id: updateExternalSubTechniqueDto.id,
        },
      });

      if (!externalSubTechnique)
        throw new NotFoundException(`External sub technique with id ${updateExternalSubTechniqueDto.id} not found`);

      const updatedExternalSubTechnique = plainToClass(ExternalSubTechnique, updateExternalSubTechniqueDto);

      updatedExternalSubTechnique.updatedBy = user.id;

      const marking = await this.markingRepository.findOne({
        where: {
          id: updateExternalSubTechniqueDto.marking,
        },
      });

      if (!marking)
        throw new NotFoundException(`Marking with id ${updateExternalSubTechniqueDto.marking} not found`);

      if (updateExternalSubTechniqueDto.tagSubTechnique) {

        const tagSubTechnique = await this.tagSubTechniqueRepository.findOne({
          where: {
            id: updateExternalSubTechniqueDto.tagSubTechnique,
          },
        });

        if (!tagSubTechnique)
          throw new NotFoundException(`Tag sub technique with id ${updateExternalSubTechniqueDto.tagSubTechnique} not found`);

        updatedExternalSubTechnique.tagSubTechnique = tagSubTechnique;
      }

      updatedExternalSubTechnique.marking = marking;

      Object.assign(externalSubTechnique, updatedExternalSubTechnique);

      const updatedExternalSubTechniqueResult = await this.externalSubTechniqueRepository.save(externalSubTechnique);

      updatedExternalSubTechniques.push(updatedExternalSubTechniqueResult);
    }

    return {
      updatedExternalSubTechniques
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
