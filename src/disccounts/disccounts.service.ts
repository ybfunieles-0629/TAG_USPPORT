import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateDisccountsDto } from './dto/create-disccounts.dto';
import { UpdateDisccountsDto } from './dto/update-disccounts.dto';
import { Disccounts } from './entities/disccounts.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DisccountsService {
  private readonly logger: Logger = new Logger('DisccountsService');

  constructor(
    @InjectRepository(Disccounts)
    private readonly disccountsRepository: Repository<Disccounts>,
  ) { }

  async create(createDisccountsDto: CreateDisccountsDto, user: User) {
    const newDisccounts = plainToClass(Disccounts, createDisccountsDto);

    newDisccounts.createdBy = user.id;

    await this.disccountsRepository.save(newDisccounts);

    return {
      newDisccounts
    };
  }

  async createMultiple(createMultipleDisccountsDto: CreateDisccountsDto[], user: User) {
    const createdDisccounts = [];

    for (const createDisccountsDto of createMultipleDisccountsDto) {
      const disccounts = this.disccountsRepository.create(createDisccountsDto);

      disccounts.createdBy = user.id;

      await this.disccountsRepository.save(disccounts);

      createdDisccounts.push(disccounts);
    }

    return {
      createdDisccounts,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.disccountsRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: Disccounts[] = await this.disccountsRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const disccounts = await this.disccountsRepository.findOne({
      where: {
        id
      },
    });

    if (!disccounts)
      throw new NotFoundException(`Disccounts with id ${disccounts} not found`);

    return {
      disccounts
    };
  }

  async update(id: string, updateDisccountsDto: UpdateDisccountsDto, user: User) {
    const disccounts = await this.disccountsRepository.findOne({
      where: {
        id,
      },
    });

    if (!disccounts)
      throw new NotFoundException(`Disccounts with id ${id} not found`);

    const updatedDisccounts = plainToClass(Disccounts, updateDisccountsDto);

    updatedDisccounts.updatedBy = user.id;

    Object.assign(disccounts, updatedDisccounts);

    await this.disccountsRepository.save(disccounts);

    return {
      disccounts
    };
  }

  async updateMultiple(udpateMultipleDisccountsDto: UpdateDisccountsDto[], user: User) {
    const updatedDisccounts = [];

    for (const updateDisccountsDto of udpateMultipleDisccountsDto) {
      const { id, ...dataToUpdate } = updateDisccountsDto;

      const disccounts = await this.disccountsRepository.findOne({
        where: {
          id
        },
      });

      if (!disccounts)
        throw new NotFoundException(`Disccounts with id ${id} not found`);

      disccounts.updatedBy = user.id;

      Object.assign(disccounts, dataToUpdate);

      await this.disccountsRepository.save(disccounts);

      updatedDisccounts.push(disccounts);
    }

    return {
      updatedDisccounts,
    };
  }


  async desactivate(id: string) {
    const { disccounts } = await this.findOne(id);

    disccounts.isActive = !disccounts.isActive;

    await this.disccountsRepository.save(disccounts);

    return {
      disccounts
    };
  }

  async remove(id: string) {
    const { disccounts } = await this.findOne(id);

    await this.disccountsRepository.remove(disccounts);

    return {
      disccounts
    };
  }
}
