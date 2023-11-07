import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarkingTagServiceDto } from './dto/create-marking-tag-service.dto';
import { UpdateMarkingTagServiceDto } from './dto/update-marking-tag-service.dto';
import { MarkingTagService } from './entities/marking-tag-service.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class MarkingTagServicesService {
  private readonly logger: Logger = new Logger('MarkingTagServicesService');

  constructor(
    @InjectRepository(MarkingTagService)
    private readonly markingTagServiceRepository: Repository<MarkingTagService>,
  ) { }

  async create(createMarkingTagServiceDto: CreateMarkingTagServiceDto) {
    try {
      const markingTagService = this.markingTagServiceRepository.create(createMarkingTagServiceDto);

      await this.markingTagServiceRepository.save(markingTagService);

      return {
        markingTagService
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markingTagServiceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'tagSubTechniques',
      ],
    });
  }

  async findOne(id: string) {
    const markingTagService = await this.markingTagServiceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'tagSubTechniques',
      ],
    });

    if (!markingTagService)
      throw new NotFoundException(`Marking tag service with id ${id} not found`);

    return {
      markingTagService
    };
  }

  async update(id: string, updateMarkingTagServiceDto: UpdateMarkingTagServiceDto) {
    const markingTagService = await this.markingTagServiceRepository.findOne({
      where: {
        id,
      },
    });

    if (!markingTagService)
      throw new NotFoundException(`Marking tag service with id ${id} not found`);

    const updatedMarkingTagService = plainToClass(MarkingTagService, updateMarkingTagServiceDto);

    Object.assign(markingTagService, updatedMarkingTagService);

    await this.markingTagServiceRepository.save(markingTagService);

    return {
      markingTagService
    };
  }

  async desactivate(id: string) {
    const { markingTagService } = await this.findOne(id);

    markingTagService.isActive = !markingTagService.isActive;

    await this.markingTagServiceRepository.save(markingTagService);

    return {
      markingTagService
    };
  }

  async remove(id: string) {
    const { markingTagService } = await this.findOne(id);

    await this.markingTagServiceRepository.remove(markingTagService);

    return {
      markingTagService
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
