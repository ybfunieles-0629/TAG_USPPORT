import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateTagSubTechniquePropertyDto } from './dto/create-tag-sub-technique-property.dto';
import { UpdateTagSubTechniquePropertyDto } from './dto/update-tag-sub-technique-property.dto';
import { TagSubTechniqueProperty } from './entities/tag-sub-technique-property.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TagSubTechnique } from '../tag-sub-techniques/entities/tag-sub-technique.entity';

@Injectable()
export class TagSubTechniquePropertiesService {
  constructor(
    @InjectRepository(TagSubTechniqueProperty)
    private readonly tagSubTechniquePropertyRepository: Repository<TagSubTechniqueProperty>,

    @InjectRepository(TagSubTechnique)
    private readonly tagSubTechniqueRepository: Repository<TagSubTechnique>,
  ) { }

  async create(createTagSubTechniquePropertyDto: CreateTagSubTechniquePropertyDto) {
    const newTagSubTechniqueProperty = plainToClass(TagSubTechniqueProperty, createTagSubTechniquePropertyDto);

    const tagSubTechnique: TagSubTechnique = await this.tagSubTechniqueRepository.findOne({
      where: {
        id: createTagSubTechniquePropertyDto.tagSubTechnique,
      },
    });

    if (!tagSubTechnique)
      throw new NotFoundException(`Tag sub technique with id ${createTagSubTechniquePropertyDto.tagSubTechnique}`);

    newTagSubTechniqueProperty.tagSubTechnique = tagSubTechnique;

    await this.tagSubTechniquePropertyRepository.save(newTagSubTechniqueProperty);

    return {
      newTagSubTechniqueProperty
    };
  }

  async createMultiple(createTagSubTechniqueProperties: CreateTagSubTechniquePropertyDto[]) {
    const createdTagSubTechniqueProperties: TagSubTechniqueProperty[] = [];

    for (const createTagSubTechniquePropertyDto of createTagSubTechniqueProperties) {
      const newTagSubTechniqueProperty = plainToClass(TagSubTechniqueProperty, createTagSubTechniquePropertyDto);

      const tagSubTechnique: TagSubTechnique = await this.tagSubTechniqueRepository.findOne({
        where: {
          id: createTagSubTechniquePropertyDto.tagSubTechnique,
        },
      });

      if (!tagSubTechnique)
        throw new NotFoundException(`Tag sub technique with id ${createTagSubTechniquePropertyDto.tagSubTechnique}`);

      newTagSubTechniqueProperty.tagSubTechnique = tagSubTechnique;

      const createdTagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.save(newTagSubTechniqueProperty);

      createdTagSubTechniqueProperties.push(createdTagSubTechniqueProperty);
    }

    return {
      createdTagSubTechniqueProperties
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.tagSubTechniquePropertyRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'tagSubTechnique',
      ],
    });
  }

  async findOne(id: string) {
    const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
      where: {
        id,
      },
      relations: [
        'tagSubTechnique',
      ],
    });

    if (!tagSubTechniqueProperty)
      throw new NotFoundException(`Tag sub technique property with id ${id} not found`);

    return {
      tagSubTechniqueProperty
    };
  }

  async update(id: string, updateTagSubTechniquePropertyDto: UpdateTagSubTechniquePropertyDto) {
    const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
      where: {
        id,
      },
      relations: [
        'tagSubTechnique',
      ],
    });

    if (!tagSubTechniqueProperty)
      throw new NotFoundException(`Tag sub technique property with id ${id} not found`);

    const updatedTagSubTechniqueProperty = plainToClass(TagSubTechniqueProperty, updateTagSubTechniquePropertyDto);

    const tagSubTechnique: TagSubTechnique = await this.tagSubTechniqueRepository.findOne({
      where: {
        id: updateTagSubTechniquePropertyDto.tagSubTechnique,
      },
    });

    if (!tagSubTechnique)
      throw new NotFoundException(`Tag sub technique with id ${updateTagSubTechniquePropertyDto.tagSubTechnique}`);

    updatedTagSubTechniqueProperty.tagSubTechnique = tagSubTechnique;

    Object.assign(tagSubTechniqueProperty, updatedTagSubTechniqueProperty);

    await this.tagSubTechniquePropertyRepository.save(tagSubTechniqueProperty);

    return {
      tagSubTechniqueProperty
    };
  }

  async updateMultiple(updateTagSubTechniqueProperties: UpdateTagSubTechniquePropertyDto[]) {
    const updatedTagSubTechniqueProperties: TagSubTechniqueProperty[] = [];

    for (const updateTagSubTechniquePropertyDto of updateTagSubTechniqueProperties) {
      const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
        where: {
          id: updateTagSubTechniquePropertyDto.id,
        },
        relations: [
          'tagSubTechnique',
        ],
      });

      if (!tagSubTechniqueProperty)
        throw new NotFoundException(`Tag sub technique property with id ${updateTagSubTechniquePropertyDto.id} not found`);

      const updatedTagSubTechniqueProperty = plainToClass(TagSubTechniqueProperty, updateTagSubTechniquePropertyDto);

      const tagSubTechnique: TagSubTechnique = await this.tagSubTechniqueRepository.findOne({
        where: {
          id: updateTagSubTechniquePropertyDto.tagSubTechnique,
        },
      });

      if (!tagSubTechnique)
        throw new NotFoundException(`Tag sub technique with id ${updateTagSubTechniquePropertyDto.tagSubTechnique}`);

      updatedTagSubTechniqueProperty.tagSubTechnique = tagSubTechnique;

      Object.assign(tagSubTechniqueProperty, updatedTagSubTechniqueProperty);

      const tagSubTechniquePropertySaved = await this.tagSubTechniquePropertyRepository.save(tagSubTechniqueProperty);
    
      updatedTagSubTechniqueProperties.push(tagSubTechniquePropertySaved);
    }

    return {
      updatedTagSubTechniqueProperties
    };
  }

  async desactivate(id: string) {
    const { tagSubTechniqueProperty } = await this.findOne(id);

    tagSubTechniqueProperty.isActive = !tagSubTechniqueProperty.isActive;

    await this.tagSubTechniquePropertyRepository.save(tagSubTechniqueProperty);

    return {
      tagSubTechniqueProperty
    };
  }

  async remove(id: string) {
    const { tagSubTechniqueProperty } = await this.findOne(id);

    await this.tagSubTechniquePropertyRepository.remove(tagSubTechniqueProperty);

    return {
      tagSubTechniqueProperty
    };
  }
}
