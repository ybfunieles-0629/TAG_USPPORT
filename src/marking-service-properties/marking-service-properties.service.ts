import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExternalSubTechnique } from '../external-sub-techniques/entities/external-sub-technique.entity';

@Injectable()
export class MarkingServicePropertiesService {
  private readonly logger: Logger = new Logger('MarkingServicePropertiesService');

  constructor(
    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,
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

    newMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

    await this.markingServicePropertyRepository.save(newMarkingServiceProperty);

    return {
      newMarkingServiceProperty
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markingServicePropertyRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'externalSubTechnique',
      ],
    });
  }

  async findOne(id: string) {
    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id,
      },
      relations: [
        'externalSubTechnique',
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

    Object.assign(markingServiceProperty, updatedMarkingServiceProperty);

    await this.markingServicePropertyRepository.save(markingServiceProperty);

    return {
      markingServiceProperty
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
