import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { MarkingServiceProperty } from './entities/marking-service-property.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class MarkingServicePropertiesService {
  private readonly logger: Logger = new Logger('MarkingServicePropertiesService');

  constructor(
    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,
  ) { }

  async create(createMarkingServicePropertyDto: CreateMarkingServicePropertyDto) {
    try {
      const markingServiceProperty = this.markingServicePropertyRepository.create(createMarkingServicePropertyDto);

      await this.markingServicePropertyRepository.save(markingServiceProperty);

      return {
        markingServiceProperty
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markingServicePropertyRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id,
      },
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service repository with id ${id} not found`);

    return {
      markingServiceProperty
    };
  }

  async update(id: string, updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto) {
    return `This action updates a #${id} markingServiceProperty`;
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
