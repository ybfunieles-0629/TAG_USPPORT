import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateListPriceDto } from './dto/create-list-price.dto';
import { UpdateListPriceDto } from './dto/update-list-price.dto';
import { ListPrice } from './entities/list-price.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ListPricesService {
  constructor(
    @InjectRepository(ListPrice)
    private readonly listPriceRepository: Repository<ListPrice>,
  ) { }

  async create(createListPriceDto: CreateListPriceDto) {
    const newListPrice = plainToClass(ListPrice, createListPriceDto);

    await this.listPriceRepository.save(newListPrice);

    return {
      newListPrice
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.listPriceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const listPrice = await this.listPriceRepository.findOne({
      where: {
        id,
      },
    });

    if (!id)
      throw new NotFoundException(`List price with id ${id} not found`);

    return {
      listPrice
    };
  }

  async update(id: string, updateListPriceDto: UpdateListPriceDto) {
    const listPrice = await this.listPriceRepository.findOne({
      where: {
        id
      },
    });

    if (!listPrice)
      throw new NotFoundException(`List price with id ${id} not found`);

    const updatedListPrice = plainToClass(ListPrice, updateListPriceDto);

    Object.assign(listPrice, updatedListPrice);

    await this.listPriceRepository.save(listPrice);

    return {
      listPrice
    };
  }

  async desactivate(id: string) {
    const { listPrice } = await this.findOne(id);

    listPrice.isActive = !listPrice.isActive;
  }

  async remove(id: string) {
    const { listPrice } = await this.findOne(id);

    await this.listPriceRepository.remove(listPrice);

    return {
      listPrice
    };
  }
}
