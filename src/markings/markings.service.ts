import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';
import { Marking } from './entities/marking.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingTagService } from '../marking-tag-services/entities/marking-tag-service.entity';
import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class MarkingsService {
  private readonly logger: Logger = new Logger('MarkingsService');

  constructor(
    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,

    @InjectRepository(MarkingTagService)
    private readonly markingTagServiceRepository: Repository<MarkingTagService>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async create(createMarkingDto: CreateMarkingDto) {
    const newMarking = plainToClass(Marking, createMarkingDto);

    await this.markingRepository.save(newMarking);

    return {
      newMarking
    };
  }

  async createMultiple(createMultipleMarkings: CreateMarkingDto[]) {
    const createdMarkings = [];

    for (const createMarkingDto of createMultipleMarkings) {
      const newMarking = plainToClass(Marking, createMarkingDto);

      await this.markingRepository.save(newMarking);

      createdMarkings.push(newMarking);
    }

    return {
      createdMarkings,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markingRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const marking = await this.markingRepository.findOne({
      where: {
        id,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${id} not found`);

    return {
      marking
    };
  }

  async update(id: string, updateMarkingDto: UpdateMarkingDto) {
    const marking = await this.markingRepository.findOne({
      where: {
        id,
      },
    });

    if (!marking)
      throw new NotFoundException(`Marking with id ${id} not found`);

    const updatedMarking = plainToClass(Marking, updateMarkingDto);

    Object.assign(marking, updatedMarking);

    await this.markingRepository.save(marking);

    return {
      marking
    };
  }

  async updateMultiple(updateMultipleMarkings: UpdateMarkingDto[]) {
    const updatedMarkings = [];

    for (const updateMarkingDto of updateMultipleMarkings) {
      const marking = await this.markingRepository.findOne({
        where: {
          id: updateMarkingDto.id,
        },
      });

      if (!marking)
        throw new NotFoundException(`Marking with id ${updateMarkingDto.id} not found`);

      const updatedMarking = plainToClass(Marking, updateMarkingDto);

      Object.assign(marking, updatedMarking);

      await this.markingRepository.save(marking);

      updatedMarkings.push(marking);
    }

    return {
      updatedMarkings,
    };
  }

  async desactivate(id: string) {
    const { marking } = await this.findOne(id);

    marking.isActive = !marking.isActive;

    await this.markingRepository.save(marking);

    return {
      marking
    };
  }

  async remove(id: string) {
    const { marking } = await this.findOne(id);

    await this.markingRepository.remove(marking);

    return {
      marking
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
