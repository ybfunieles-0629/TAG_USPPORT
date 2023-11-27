import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExternalSubTechnique } from '../external-sub-techniques/entities/external-sub-technique.entity';
import { TagSubTechniqueProperty } from 'src/tag-sub-technique-properties/entities/tag-sub-technique-property.entity';

@Injectable()
export class MarkingServicePropertiesService {
  private readonly logger: Logger = new Logger('MarkingServicePropertiesService');

  constructor(
    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,

    @InjectRepository(TagSubTechniqueProperty)
    private readonly tagSubTechniquePropertyRepository: Repository<TagSubTechniqueProperty>,
  ) { }

  async create(createMarkingServicePropertyDto: CreateMarkingServicePropertyDto) {
    const newMarkingServiceProperty = plainToClass(MarkingServiceProperty, createMarkingServicePropertyDto);

    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id: createMarkingServicePropertyDto.externalSubTechnique,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${createMarkingServicePropertyDto.externalSubTechnique} not found`);

    if (createMarkingServicePropertyDto.tagSubTechniqueProperty) {
      const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
        where: {
          id: createMarkingServicePropertyDto.tagSubTechniqueProperty,
        },
      });

      if (!tagSubTechniqueProperty)
        throw new NotFoundException(`Tag sub technique property with id ${createMarkingServicePropertyDto.tagSubTechniqueProperty} not found`);

      if (!tagSubTechniqueProperty.isActive)
        throw new BadRequestException(`Tag sub technique property with id ${createMarkingServicePropertyDto.tagSubTechniqueProperty} is currently inactive`);

      newMarkingServiceProperty.tagSubTechniqueProperty = tagSubTechniqueProperty;
    }

    newMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

    await this.markingServicePropertyRepository.save(newMarkingServiceProperty);

    return {
      newMarkingServiceProperty
    };
  }

  async createMultiple(createMarkingServiceProperties: CreateMarkingServicePropertyDto[]) {
    const createdMarkingServiceProperties: MarkingServiceProperty[] = [];

    for (const createMarkingServicePropertyDto of createMarkingServiceProperties) {

      const newMarkingServiceProperty = plainToClass(MarkingServiceProperty, createMarkingServicePropertyDto);

      const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
        where: {
          id: createMarkingServicePropertyDto.externalSubTechnique,
        },
      });

      if (!externalSubTechnique)
        throw new NotFoundException(`External sub technique with id ${createMarkingServicePropertyDto.externalSubTechnique} not found`);

      if (createMarkingServicePropertyDto.tagSubTechniqueProperty) {
        const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
          where: {
            id: createMarkingServicePropertyDto.tagSubTechniqueProperty,
          },
        });

        if (!tagSubTechniqueProperty)
          throw new NotFoundException(`Tag sub technique property with id ${createMarkingServicePropertyDto.tagSubTechniqueProperty} not found`);

        if (!tagSubTechniqueProperty.isActive)
          throw new BadRequestException(`Tag sub technique property with id ${createMarkingServicePropertyDto.tagSubTechniqueProperty} is currently inactive`);

        newMarkingServiceProperty.tagSubTechniqueProperty = tagSubTechniqueProperty;
      }

      newMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

      const createdMarkingServiceProperty = await this.markingServicePropertyRepository.save(newMarkingServiceProperty);

      createdMarkingServiceProperties.push(createdMarkingServiceProperty);
    }

    return {
      createdMarkingServiceProperties
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.markingServicePropertyRepository.count();
    
    const { limit = count, offset = 0 } = paginationDto;

    const results: MarkingServiceProperty[] = await this.markingServicePropertyRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'externalSubTechnique',
        'images',
        'tagSubTechniqueProperty',
      ],
    });
    
    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id,
      },
      relations: [
        'externalSubTechnique',
        'images',
        'tagSubTechniqueProperty',
      ],
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service repository with id ${id} not found`);

    return {
      markingServiceProperty
    };
  }

  async update(id: string, updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto) {
    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id,
      },
      relations: [
        'externalSubTechnique',
        'images',
        'tagSubTechniqueProperty',
      ],
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${id} not found`);

    const updatedMarkingServiceProperty = plainToClass(MarkingServiceProperty, updateMarkingServicePropertyDto);

    const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
      where: {
        id: updateMarkingServicePropertyDto.externalSubTechnique,
      },
    });

    if (!externalSubTechnique)
      throw new NotFoundException(`External sub technique with id ${updateMarkingServicePropertyDto.externalSubTechnique} not found`);

    updatedMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

    if (updateMarkingServicePropertyDto.tagSubTechniqueProperty) {
      const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
        where: {
          id: updateMarkingServicePropertyDto.tagSubTechniqueProperty,
        },
      });

      if (!tagSubTechniqueProperty)
        throw new NotFoundException(`Tag sub technique property with id ${updateMarkingServicePropertyDto.tagSubTechniqueProperty} not found`);

      if (!tagSubTechniqueProperty.isActive)
        throw new BadRequestException(`Tag sub technique property with id ${updateMarkingServicePropertyDto.tagSubTechniqueProperty} is currently inactive`);

      updatedMarkingServiceProperty.tagSubTechniqueProperty = tagSubTechniqueProperty;
    }

    Object.assign(markingServiceProperty, updatedMarkingServiceProperty);

    await this.markingServicePropertyRepository.save(markingServiceProperty);

    return {
      markingServiceProperty
    };
  }

  async updateMultiple(updateMarkingServiceProperties: UpdateMarkingServicePropertyDto[]) {
    const updatedMarkingServiceProperties: MarkingServiceProperty[] = [];

    for (const updateMarkingServicePropertyDto of updateMarkingServiceProperties) {


      const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
        where: {
          id: updateMarkingServicePropertyDto.id,
        },
        relations: [
          'externalSubTechnique',
          'images',
          'tagSubTechniqueProperty',
        ],
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Marking service property with id ${updateMarkingServicePropertyDto.id} not found`);

      const updatedMarkingServiceProperty = plainToClass(MarkingServiceProperty, updateMarkingServicePropertyDto);

      const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
        where: {
          id: updateMarkingServicePropertyDto.externalSubTechnique,
        },
      });

      if (!externalSubTechnique)
        throw new NotFoundException(`External sub technique with id ${updateMarkingServicePropertyDto.externalSubTechnique} not found`);

      updatedMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

      if (updateMarkingServicePropertyDto.tagSubTechniqueProperty) {
        const tagSubTechniqueProperty = await this.tagSubTechniquePropertyRepository.findOne({
          where: {
            id: updateMarkingServicePropertyDto.tagSubTechniqueProperty,
          },
        });

        if (!tagSubTechniqueProperty)
          throw new NotFoundException(`Tag sub technique property with id ${updateMarkingServicePropertyDto.tagSubTechniqueProperty} not found`);

        if (!tagSubTechniqueProperty.isActive)
          throw new BadRequestException(`Tag sub technique property with id ${updateMarkingServicePropertyDto.tagSubTechniqueProperty} is currently inactive`);

        updatedMarkingServiceProperty.tagSubTechniqueProperty = tagSubTechniqueProperty;
      }

      Object.assign(markingServiceProperty, updatedMarkingServiceProperty);

      const updatedMarkingServicePropertyResult = await this.markingServicePropertyRepository.save(markingServiceProperty);

      updatedMarkingServiceProperties.push(updatedMarkingServicePropertyResult);
    }

    return {
      updatedMarkingServiceProperties
    };
  }

  async desactivate(id: string) {
    const { markingServiceProperty } = await this.findOne(id);

    markingServiceProperty.isActive = !markingServiceProperty.isActive;

    await this.markingServicePropertyRepository.save(markingServiceProperty);

    return {
      markingServiceProperty
    };
  }

  async remove(id: string) {
    const { markingServiceProperty } = await this.findOne(id);

    await this.markingServicePropertyRepository.remove(markingServiceProperty);

    return {
      markingServiceProperty
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
