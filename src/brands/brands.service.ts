import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';
import { Access } from '../access/entities/access.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class BrandsService {
  private readonly logger: Logger = new Logger('BrandsService');

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
  ) { }

  async create(createBrandDto: CreateBrandDto) {
    try {
      const newBrand = plainToClass(Brand, createBrandDto);

      const access = await this.accessRepository.findOneBy({ id: createBrandDto.access });

      if (!access)
        throw new NotFoundException(`Access with id ${createBrandDto.access} not found`);

      newBrand.access = access;

      await this.brandRepository.save(newBrand);

      return {
        newBrand
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.brandRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'access',
        'access.user',
        'access.client',
      ],
    });
  }

  async findOne(term: string) {
    let brand: Brand;

    if (isUUID(term)) {
      brand = await this.brandRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.brandRepository.createQueryBuilder();

      brand = await queryBuilder
        .where('LOWER(name) =: name', {
          name: term.toLowerCase()
        })
        .getOne();
    }

    if (!brand)
      throw new NotFoundException(`Brand with ${term} not found`);

    return {
      brand
    };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOne({ 
      where: {
        id
      },
    });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    if (updateBrandDto.access) {
      const access = await this.accessRepository.findOne({
        where: {
          id: updateBrandDto.access
        },
      });

      if (!access)
        throw new NotFoundException(`Access with id ${access} not found`);

      brand.access = access;
    }

    await this.brandRepository.save(brand);

    return {
      brand
    };
  }

  async desactivate(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    brand.isActive = !brand.isActive;

    return {
      brand
    };
  }

  async remove(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    await this.brandRepository.remove(brand);

    return {
      brand
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
