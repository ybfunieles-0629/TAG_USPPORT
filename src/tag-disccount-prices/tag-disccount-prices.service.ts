import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateTagDisccountPriceDto } from './dto/create-tag-disccount-price.dto';
import { UpdateTagDisccountPriceDto } from './dto/update-tag-disccount-price.dto';
import { TagDisccountPrice } from './entities/tag-disccount-price.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TagDisccountPricesService {
  constructor(
    @InjectRepository(TagDisccountPrice)
    private readonly tagDisccountPriceRepository: Repository<TagDisccountPrice>,
  ) { }

  async create(createTagDisccountPriceDto: CreateTagDisccountPriceDto, user: User) {
    const newTagDisccountPrice: TagDisccountPrice = plainToClass(TagDisccountPrice, createTagDisccountPriceDto);

    newTagDisccountPrice.createdBy = user.id;

    await this.tagDisccountPriceRepository.save(newTagDisccountPrice);

    return {
      newTagDisccountPrice
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.tagDisccountPriceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const tagDisccountPrice = await this.tagDisccountPriceRepository.findOne({
      where: {
        id
      },
    });

    if (!tagDisccountPrice)
      throw new NotFoundException(`Tag disccount price with id ${id} not found`);

    return {
      tagDisccountPrice
    };
  }

  async update(id: string, updateTagDisccountPriceDto: UpdateTagDisccountPriceDto, user: User) {
    const tagDisccountPrice = await this.tagDisccountPriceRepository.findOne({
      where: {
        id,
      },
    });

    const updatedTagDisccountPrice = plainToClass(TagDisccountPrice, updateTagDisccountPriceDto);

    updatedTagDisccountPrice.updatedBy = user.id;

    Object.assign(tagDisccountPrice, updatedTagDisccountPrice);

    await this.tagDisccountPriceRepository.save(tagDisccountPrice);

    return {
      tagDisccountPrice
    };
  }

  async desactivate(id: string) {
    const { tagDisccountPrice } = await this.findOne(id);

    tagDisccountPrice.isActive = !tagDisccountPrice.isActive;

    await this.tagDisccountPriceRepository.save(tagDisccountPrice);

    return {
      tagDisccountPrice
    };
  }

  async remove(id: string) {
    const { tagDisccountPrice } = await this.findOne(id);
  
    await this.tagDisccountPriceRepository.remove(tagDisccountPrice);

    return {
      tagDisccountPrice
    };
  }
}
