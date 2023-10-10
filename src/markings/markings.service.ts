import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';
import { Marking } from './entities/marking.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MarkingsService {
  private readonly logger: Logger = new Logger('MarkingsService');

  constructor(
    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,
  ) { }

  async create(createMarkingDto: CreateMarkingDto) {
    try {
      const marking = this.markingRepository.create(createMarkingDto);

      await this.markingRepository.save(marking);

      return {
        marking
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
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
    return `This action updates a #${id} marking`;
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
