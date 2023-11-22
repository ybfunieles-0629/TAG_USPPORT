import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateDisccountDto } from './dto/create-disccount.dto';
import { UpdateDisccountDto } from './dto/update-disccount.dto';
import { Disccount } from './entities/disccount.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Disccounts } from '../disccounts/entities/disccounts.entity';

@Injectable()
export class DisccountService {
  private readonly logger: Logger = new Logger('DisccountService');

  constructor(
    @InjectRepository(Disccount)
    private readonly disccountRepository: Repository<Disccount>,

    @InjectRepository(Disccounts)
    private readonly disccountsRepository: Repository<Disccounts>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) { }

  async create(createDisccountDto: CreateDisccountDto) {
    const newDisccount = plainToClass(Disccount, createDisccountDto);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createDisccountDto.supplier
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${createDisccountDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${createDisccountDto.supplier} is currently inactive`);

    newDisccount.supplier = supplier;

    const disccounts: Disccounts[] = [];

    for (const disccountsId of createDisccountDto.disccounts) {
      const disccountsInDb = await this.disccountsRepository.findOne({
        where: {
          id: disccountsId
        },
      });

      if (!disccounts)
        throw new NotFoundException(`Disccounts with id ${disccountsId} not found`);

      if (!disccountsInDb.isActive)
        throw new BadRequestException(`Disccounts with id ${disccountsId} is currently inactive`);

      disccounts.push(disccountsInDb);
    }

    newDisccount.disccounts = disccounts;

    await this.disccountRepository.save(newDisccount);

    return {
      newDisccount
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.disccountRepository.count();
    
    const { limit = count, offset = 0 } = paginationDto;

    const results: Disccount[] = await this.disccountRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'disccounts',
        'supplier',
        'supplier.user',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const disccount = await this.disccountRepository.findOne({
      where: {
        id,
      },
      relations: [
        'disccounts',
        'supplier',
        'supplier.user',
      ],
    });

    if (!disccount)
      throw new NotFoundException(`Disccount with id ${id} not found`);

    return {
      disccount
    };
  }

  async update(id: string, updateDisccountDto: UpdateDisccountDto) {
    const disccount = await this.disccountRepository.findOne({
      where: {
        id,
      },
      relations: [
        'disccounts',
        'supplier',
        'supplier.user',
      ],
    });

    if (!disccount)
      throw new NotFoundException(`Disccount with id ${id} not found`);

    if (updateDisccountDto.supplier) {
      const supplier = await this.supplierRepository.findOne({
        where: {
          id: updateDisccountDto.supplier
        },
      });

      if (!supplier)
        throw new NotFoundException(`Supplier with id ${updateDisccountDto.supplier} not found`);

      if (!supplier.isActive)
        throw new BadRequestException(`Supplier with id ${updateDisccountDto.supplier} is currently inactive`);

      disccount.supplier = supplier;
    }

    const disccounts: Disccounts[] = [];

    if (updateDisccountDto.disccounts) {
      for (const disccountsId of updateDisccountDto.disccounts) {
        const disccountsInDb = await this.disccountsRepository.findOne({
          where: {
            id: disccountsId
          },
        });

        if (!disccounts)
          throw new NotFoundException(`Disccounts with id ${disccountsId} not found`);

        if (!disccountsInDb.isActive)
          throw new BadRequestException(`Disccounts with id ${disccountsId} is currently inactive`);

        disccounts.push(disccountsInDb);
      }
    }

    const updatedDisccount = plainToClass(Disccount, updateDisccountDto);

    updatedDisccount.disccounts = disccounts;

    Object.assign(disccount, updatedDisccount);

    await this.disccountRepository.save(disccount);

    return {
      disccount
    };
  }

  async desactivate(id: string) {
    const { disccount } = await this.findOne(id);

    disccount.isActive = !disccount.isActive;

    await this.disccountRepository.save(disccount);

    return {
      disccount
    };
  }

  async remove(id: string) {
    const { disccount } = await this.findOne(id);

    await this.disccountRepository.remove(disccount);

    return {
      disccount
    };
  }
}
