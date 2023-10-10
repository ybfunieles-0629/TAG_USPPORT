import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';
import { MarkedServicePrice } from './entities/marked-service-price.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MarkedServicePricesService {
  private readonly logger: Logger = new Logger('MarkedServicePricesService');

  constructor(
    @InjectRepository(MarkedServicePrice)
    private readonly markedServicePriceRepository: Repository<MarkedServicePrice>
  ) { }

  async create(createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    try {
      const markedServicePrice = this.markedServicePriceRepository.create(createMarkedServicePriceDto);

      await this.markedServicePriceRepository.save(markedServicePrice);

      return {
        markedServicePrice
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.markedServicePriceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const markedServicePrice = await this.markedServicePriceRepository.findOne({
      where: {
        id
      },
    });
    
    if (!markedServicePrice)
      throw new NotFoundException(`Marked service price with id ${id} not found`);

    return {
      markedServicePrice
    };
  }

  async update(id: string, updateMarkedServicePriceDto: UpdateMarkedServicePriceDto) {
    return `This action updates a #${id} markedServicePrice`;
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
