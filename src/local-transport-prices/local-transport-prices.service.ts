import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateLocalTransportPriceDto } from './dto/create-local-transport-price.dto';
import { UpdateLocalTransportPriceDto } from './dto/update-local-transport-price.dto';
import { LocalTransportPrice } from './entities/local-transport-price.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TransportService } from 'src/transport-services/entities/transport-service.entity';

@Injectable()
export class LocalTransportPricesService {
  constructor(
    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

    @InjectRepository(TransportService)
    private readonly transportServiceRepository: Repository<TransportService>,
  ) { }

  async create(createLocalTransportPriceDto: CreateLocalTransportPriceDto) {
    const newLocalTransportPrice = plainToClass(LocalTransportPrice, createLocalTransportPriceDto);

    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id: createLocalTransportPriceDto.transportService,
      },
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${createLocalTransportPriceDto.transportService} not found`);

    newLocalTransportPrice.transportService = transportService;

    await this.localTransportPriceRepository.save(newLocalTransportPrice);

    return {
      newLocalTransportPrice
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.localTransportPriceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'transportService',
      ],
    });
  }

  async findOne(id: string) {
    const localTransportPrice = await this.localTransportPriceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'transportService',
      ],
    });

    if (!localTransportPrice)
      throw new NotFoundException(`Local transport price with id ${id} not found`);

    return {
      localTransportPrice
    };
  }

  async update(id: string, updateLocalTransportPriceDto: UpdateLocalTransportPriceDto) {
    const localTransportPrice = await this.localTransportPriceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'transportPrice',
      ],
    });

    if (!localTransportPrice)
      throw new NotFoundException(`Local transport price with id ${id} not found`);

    const updatedLocalTransportPrice = plainToClass(LocalTransportPrice, updateLocalTransportPriceDto);

    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id: updateLocalTransportPriceDto.transportService,
      },
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${updateLocalTransportPriceDto.transportService} not found`);

    updatedLocalTransportPrice.transportService = transportService;

    Object.assign(localTransportPrice, updatedLocalTransportPrice);

    await this.localTransportPriceRepository.save(localTransportPrice);

    return {
      localTransportPrice
    };
  }

  async desactivate(id: string) {
    const { localTransportPrice } = await this.findOne(id);

    localTransportPrice.isActive = !localTransportPrice.isActive;

    await this.localTransportPriceRepository.save(localTransportPrice);

    return {
      localTransportPrice
    };
  }

  async remove(id: string) {
    const { localTransportPrice } = await this.findOne(id);

    await this.localTransportPriceRepository.remove(localTransportPrice);

    return {
      localTransportPrice
    };
  }
}
