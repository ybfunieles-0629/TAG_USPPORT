import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';
import { MarkedServicePrice } from './entities/marked-service-price.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';

@Injectable()
export class MarkedServicePricesService {
  private readonly logger: Logger = new Logger('MarkedServicePricesService');

  constructor(
    @InjectRepository(MarkedServicePrice)
    private readonly markedServicePriceRepository: Repository<MarkedServicePrice>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,
  ) { }

  async create(createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    const newMarkedServicePrice = plainToClass(MarkedServicePrice, createMarkedServicePriceDto);

    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id: createMarkedServicePriceDto.markingServiceProperty,
      },
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${createMarkedServicePriceDto.markingServiceProperty} not found`);

    newMarkedServicePrice.markingServiceProperty = markingServiceProperty;

    await this.markedServicePriceRepository.save(newMarkedServicePrice);

    return {
      newMarkedServicePrice
    };
  }

  async createMultiple(createMarkedServicePrices: CreateMarkedServicePriceDto[]) {
    const createdMarkedServicePrices: MarkedServicePrice[] = [];

    for (const createMarkedServicePriceDto of createMarkedServicePrices) {
      const newMarkedServicePrice = plainToClass(MarkedServicePrice, createMarkedServicePriceDto);

      const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
        where: {
          id: createMarkedServicePriceDto.markingServiceProperty,
        },
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Marking service property with id ${createMarkedServicePriceDto.markingServiceProperty} not found`);

      newMarkedServicePrice.markingServiceProperty = markingServiceProperty;

      const createdMarkedServicePrice = await this.markedServicePriceRepository.save(newMarkedServicePrice);

      createdMarkedServicePrices.push(createdMarkedServicePrice);
    }

    return {
      createdMarkedServicePrices
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markedServicePriceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingServiceProperty',
      ],
    });
  }

  async findOne(id: string) {
    const markedServicePrice = await this.markedServicePriceRepository.findOne({
      where: {
        id
      },
      relations: [
        'markingServiceProperty',
      ],
    });

    if (!markedServicePrice)
      throw new NotFoundException(`Marked service price with id ${id} not found`);

    return {
      markedServicePrice
    };
  }

  async update(id: string, updateMarkedServicePriceDto: UpdateMarkedServicePriceDto) {
    const markedServicePrice = await this.markedServicePriceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markedServicePrice',
      ],
    });

    if (!markedServicePrice)
      throw new NotFoundException(`Marked service price with id ${id} not found`);

    const updatedMarkedServicePrice = plainToClass(MarkedServicePrice, updateMarkedServicePriceDto);

    const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
      where: {
        id: updateMarkedServicePriceDto.markingServiceProperty,
      },
    });

    if (!markingServiceProperty)
      throw new NotFoundException(`Marking service property with id ${updateMarkedServicePriceDto.markingServiceProperty} not found`);

    updatedMarkedServicePrice.markingServiceProperty = markingServiceProperty;

    Object.assign(markedServicePrice, updatedMarkedServicePrice);

    await this.markedServicePriceRepository.save(markedServicePrice);

    return {
      markedServicePrice
    };
  }

  async updateMultiple(updateMarkedServicePrices: UpdateMarkedServicePriceDto[]) {
    const updatedMarkedServicePrices: MarkedServicePrice[] = [];

    for (const updateMarkedServicePriceDto of updateMarkedServicePrices) {
      const markedServicePrice = await this.markedServicePriceRepository.findOne({
        where: {
          id: updateMarkedServicePriceDto.id,
        },
        relations: [
          'markedServicePrice',
        ],
      });

      if (!markedServicePrice)
        throw new NotFoundException(`Marked service price with id ${updateMarkedServicePriceDto.id} not found`);

      const updatedMarkedServicePrice = plainToClass(MarkedServicePrice, updateMarkedServicePriceDto);

      const markingServiceProperty = await this.markingServicePropertyRepository.findOne({
        where: {
          id: updateMarkedServicePriceDto.markingServiceProperty,
        },
      });

      if (!markingServiceProperty)
        throw new NotFoundException(`Marking service property with id ${updateMarkedServicePriceDto.markingServiceProperty} not found`);

      updatedMarkedServicePrice.markingServiceProperty = markingServiceProperty;

      Object.assign(markedServicePrice, updatedMarkedServicePrice);

      const updatedMarkedServicePriceResult = await this.markedServicePriceRepository.save(markedServicePrice);

      updatedMarkedServicePrices.push(updatedMarkedServicePriceResult);
    }

    return {
      updatedMarkedServicePrices
    };
  }

  async desactivate(id: string) {
    const { markedServicePrice } = await this.findOne(id);

    markedServicePrice.isActive = !markedServicePrice.isActive;

    await this.markedServicePriceRepository.save(markedServicePrice);

    return {
      markedServicePrice
    };
  }

  async remove(id: string) {
    const { markedServicePrice } = await this.findOne(id);

    await this.markedServicePriceRepository.remove(markedServicePrice);

    return {
      markedServicePrice
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
