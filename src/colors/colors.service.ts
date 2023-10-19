import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Color } from './entities/color.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ColorsService {
  private readonly logger: Logger = new Logger('ColorsService');

  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) { }

  async create(createColorDto: CreateColorDto) {
    const newColor = plainToClass(Color, createColorDto);

    await this.colorRepository.save(newColor);

    return {
      newColor
    };
  }

  async createMultiple(createMultipleColors: CreateColorDto[]) {
    const createdColors = [];

    for (const createColorDto of createMultipleColors) {
      const color = this.colorRepository.create(createColorDto);

      await this.colorRepository.save(color);

      createdColors.push(color);
    }

    return {
      createdColors,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.colorRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'product',
      ],
    });
  }

  async findOne(id: string) {
    const color = await this.colorRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
      ],
    });

    if (!color)
      throw new NotFoundException(`Color with id ${id} not found`);

    return {
      color
    };
  }

  async update(id: string, updateColorDto: UpdateColorDto) {
    const color = await this.colorRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
      ],
    });

    if (!color)
      throw new NotFoundException(`Color with id ${id} not found`);

    const updatedColor = plainToClass(Color, updateColorDto);

    Object.assign(color, updatedColor);

    await this.colorRepository.save(color);

    return {
      color
    };
  }

  async updateMultiple(updateMultipleColors: UpdateColorDto[]) {
    const updatedColors = [];

    for (const updateColorDto of updateMultipleColors) {
      const { id, ...dataToUpdate } = updateColorDto;

      const color = await this.colorRepository.findOne({
        where: {
          id,
        },
      });

      if (!color)
        throw new NotFoundException(`Color with id ${id} not found`);

      Object.assign(color, dataToUpdate);

      await this.colorRepository.save(color);

      updatedColors.push(color);
    }

    return {
      updatedColors,
    };
  }

  // async desactivate(id: string) {
  //   const { color } = await this.findOne(id);

  //   color.

  //   return {
  //     color
  //   };
  // }

  async remove(id: string) {
    const { color } = await this.findOne(id);

    await this.colorRepository.remove(color);

    return {
      color
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
