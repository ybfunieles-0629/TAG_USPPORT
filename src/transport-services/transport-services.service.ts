import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateTransportServiceDto } from './dto/create-transport-service.dto';
import { UpdateTransportServiceDto } from './dto/update-transport-service.dto';
import { TransportService } from './entities/transport-service.entity';
import { QuoteDetail } from '../quote-details/entities/quote-detail.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TransportServicesService {
  constructor(
    @InjectRepository(TransportService)
    private readonly transportServiceRepository: Repository<TransportService>,

    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,
  ) { }

  async create(createTransportServiceDto: CreateTransportServiceDto) {
    const newTransportService = plainToClass(TransportService, createTransportServiceDto);

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id: createTransportServiceDto.quoteDetail,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${createTransportServiceDto.quoteDetail} not found`);

    newTransportService.quoteDetail = quoteDetail;

    await this.transportServiceRepository.save(newTransportService);

    return {
      newTransportService
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.transportServiceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'quoteDetail',
      ],
    });
  }

  async findOne(id: string) {
    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id,
      },
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${id} not found`);

    return {
      transportService
    };
  }

  async update(id: string, updateTransportServiceDto: UpdateTransportServiceDto) {
    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id,
      },
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${id} not found`);

    const updatedTransportService = plainToClass(TransportService, updateTransportServiceDto);

    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id: updateTransportServiceDto.quoteDetail,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${updateTransportServiceDto.quoteDetail} not found`);

    updatedTransportService.quoteDetail = quoteDetail;

    Object.assign(transportService, updatedTransportService);

    await this.transportServiceRepository.save(transportService);

    return {
      transportService
    };
  }

  async desactivate(id: string) {
    const { transportService } = await this.findOne(id);

    transportService.isActive = !transportService.isActive;

    await this.transportServiceRepository.save(transportService);

    return {
      transportService
    };
  }

  async remove(id: string) {
    const { transportService } = await this.findOne(id);
  
    await this.transportServiceRepository.remove(transportService);

    return {
      transportService
    };
  }
}
