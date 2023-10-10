import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { Packing } from './entities/packing.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PackingsService {
  private readonly logger: Logger = new Logger('PackingsService');

  constructor(
    @InjectRepository(Packing)
    private readonly packingRepository: Repository<Packing>,
  ) { }

  async create(createPackingDto: CreatePackingDto) {
    try {
      const packing = this.packingRepository.create(createPackingDto);

      await this.packingRepository.save(packing);

      return {
        packing
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.packingRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const packing = await this.packingRepository.findOne({
      where: {
        id,
      },
    });

    if (!packing)
      throw new NotFoundException(`Packing with id ${id} not found`);

    return {
      packing
    };
  }

  async update(id: string, updatePackingDto: UpdatePackingDto) {
    return `This action updates a #${id} packing`;
  }

  async desactivate(id: string) {
    const { packing } = await this.findOne(id);

    packing.isActive = !packing.isActive;

    await this.packingRepository.save(packing);

    return {
      packing
    };
  }

  async remove(id: string) {
    const { packing } = await this.findOne(id);

    await this.packingRepository.remove(packing);

    return {
      packing
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
