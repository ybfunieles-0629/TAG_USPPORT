import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExternalSubTechnique } from '../external-sub-techniques/entities/external-sub-technique.entity';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class MarkingServicePropertiesService {
  private readonly logger: Logger = new Logger('MarkingServicePropertiesService');

  constructor(
    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(ExternalSubTechnique)
    private readonly externalSubTechniqueRepository: Repository<ExternalSubTechnique>,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
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

    if (createMarkingServicePropertyDto.images) {
      const images: Image[] = [];

      for (const imageId of createMarkingServicePropertyDto.images) {
        const image: Image = await this.imageRepository.findOne({
          where: {
            id: imageId,
          },
        });

        if (!image)
          throw new NotFoundException(`Image with id ${imageId} not found`);

        images.push(image);
      };

      newMarkingServiceProperty.images = images;
    }

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

      newMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

      if (createMarkingServicePropertyDto.images) {
        const images: Image[] = [];

        for (const imageId of createMarkingServicePropertyDto.images) {
          const image: Image = await this.imageRepository.findOne({
            where: {
              id: imageId,
            },
          });

          if (!image)
            throw new NotFoundException(`Image with id ${imageId} not found`);

          images.push(image);
        };

        newMarkingServiceProperty.images = images;
      }

      const createdMarkingServiceProperty = await this.markingServicePropertyRepository.save(newMarkingServiceProperty);

      createdMarkingServiceProperties.push(createdMarkingServiceProperty);
    }

    return {
      createdMarkingServiceProperties
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markingServicePropertyRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'externalSubTechnique',
        'images',
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
        'images',
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
      ],
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${id} not found`);

    const updatedMarkingServiceProperty = plainToClass(MarkingServiceProperty, updateMarkingServicePropertyDto);

    if (updateMarkingServicePropertyDto.images) {
      const images: Image[] = [];

      for (const imageId of updateMarkingServicePropertyDto.images) {
        const image: Image = await this.imageRepository.findOne({
          where: {
            id: imageId,
          },
        });

        if (!image)
          throw new NotFoundException(`Image with id ${imageId} not found`);

        images.push(image);
      };

      updatedMarkingServiceProperty.images = images;
    }

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
        ],
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Marking service property with id ${updateMarkingServicePropertyDto.id} not found`);

      const updatedMarkingServiceProperty = plainToClass(MarkingServiceProperty, updateMarkingServicePropertyDto);

      if (updateMarkingServicePropertyDto.images) {
        const images: Image[] = [];

        for (const imageId of updateMarkingServicePropertyDto.images) {
          const image: Image = await this.imageRepository.findOne({
            where: {
              id: imageId,
            },
          });

          if (!image)
            throw new NotFoundException(`Image with id ${imageId} not found`);

          images.push(image);
        };

        updatedMarkingServiceProperty.images = images;
      }

      const externalSubTechnique = await this.externalSubTechniqueRepository.findOne({
        where: {
          id: updateMarkingServicePropertyDto.externalSubTechnique,
        },
      });

      if (!externalSubTechnique)
        throw new NotFoundException(`External sub technique with id ${updateMarkingServicePropertyDto.externalSubTechnique} not found`);

      updatedMarkingServiceProperty.externalSubTechnique = externalSubTechnique;

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
