import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMarketDesignAreaDto } from './dto/create-market-design-area.dto';
import { UpdateMarketDesignAreaDto } from './dto/update-market-design-area.dto';
import { MarketDesignArea } from './entities/market-design-area.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class MarketDesignAreaService {
  private readonly logger: Logger = new Logger('MarketDesignAreaService');

  constructor(
    @InjectRepository(MarketDesignArea)
    private readonly marketDesignAreaRepository: Repository<MarketDesignArea>,
  ) { }

  async create(createMarketDesignAreaDto: CreateMarketDesignAreaDto) {
    try {
      createMarketDesignAreaDto.large = +createMarketDesignAreaDto.large;

      const marketDesignArea: MarketDesignArea = this.marketDesignAreaRepository.create(createMarketDesignAreaDto);

      await this.marketDesignAreaRepository.save(marketDesignArea);

      return {
        marketDesignArea
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    return this.marketDesignAreaRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const marketDesignArea = await this.marketDesignAreaRepository.findOne({
      where: {
        id
      },
    });

    if (!marketDesignArea)
      throw new NotFoundException(`Market design area with id ${id} not found`);

    return {
      marketDesignArea
    };
  }

  async update(id: string, updateMarketDesignAreaDto: UpdateMarketDesignAreaDto) {
    const marketDesignArea: MarketDesignArea = await this.marketDesignAreaRepository.findOne({
      where: {
        id,
      },
    });

    if (!marketDesignArea)
      throw new NotFoundException(`Market design area with id ${id} not found`);

    const updatedMarketDesignArea = plainToClass(MarketDesignArea, updateMarketDesignAreaDto);

    Object.assign(marketDesignArea, updatedMarketDesignArea);

    await this.marketDesignAreaRepository.save(marketDesignArea);

    return {
      marketDesignArea
    };
  }

  async remove(id: string) {
    const { marketDesignArea } = await this.findOne(id);

    await this.marketDesignAreaRepository.remove(marketDesignArea);

    return {
      marketDesignArea
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
