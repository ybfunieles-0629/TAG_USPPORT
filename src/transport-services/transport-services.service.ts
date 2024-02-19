import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateTransportServiceDto } from './dto/create-transport-service.dto';
import { UpdateTransportServiceDto } from './dto/update-transport-service.dto';
import { TransportService } from './entities/transport-service.entity';
import { QuoteDetail } from '../quote-details/entities/quote-detail.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransportServicesService {
  constructor(
    @InjectRepository(TransportService)
    private readonly transportServiceRepository: Repository<TransportService>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,
  ) { }

  async create(createTransportServiceDto: CreateTransportServiceDto, user: User) {
    const newTransportService = plainToClass(TransportService, createTransportServiceDto);

    newTransportService.createdBy = user.id;

    if (createTransportServiceDto.quoteDetail) {
      const quoteDetail = await this.quoteDetailRepository.findOne({
        where: {
          id: createTransportServiceDto.quoteDetail,
        },
      });

      if (!quoteDetail)
        throw new NotFoundException(`Quote detail with id ${createTransportServiceDto.quoteDetail} not found`);

      newTransportService.quoteDetail = quoteDetail;
    }

    if (createTransportServiceDto.company) {
      const company = await this.companyRepository.findOne({
        where: {
          id: createTransportServiceDto.company,
        },
      });

      if (!company)
        throw new NotFoundException(`Company with id ${createTransportServiceDto.company} not found`);

      newTransportService.company = company;
    }

    await this.transportServiceRepository.save(newTransportService);

    return {
      newTransportService
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.transportServiceRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: TransportService[] = await this.transportServiceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'company',
        'localTransportPrices',
        'quoteDetail',
      ],
    });
  
    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'company',
        'localTransportPrices',
        'quoteDetail',
      ]
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${id} not found`);

    return {
      transportService
    };
  }

  async update(id: string, updateTransportServiceDto: UpdateTransportServiceDto,  user: User) {
    const transportService = await this.transportServiceRepository.findOne({
      where: {
        id,
      },
      relations: [
        'company',
        'localTransportPrices',
        'quoteDetail',
      ],
    });

    if (!transportService)
      throw new NotFoundException(`Transport service with id ${id} not found`);

    const updatedTransportService = plainToClass(TransportService, updateTransportServiceDto);

    updatedTransportService.updatedBy = user.id;

    if (updateTransportServiceDto.quoteDetail) {
      const quoteDetail = await this.quoteDetailRepository.findOne({
        where: {
          id: updateTransportServiceDto.quoteDetail,
        },
      });

      if (!quoteDetail)
        throw new NotFoundException(`Quote detail with id ${updateTransportServiceDto.quoteDetail} not found`);

      updatedTransportService.quoteDetail = quoteDetail;
    }

    if (updateTransportServiceDto.company) {
      const company = await this.companyRepository.findOne({
        where: {
          id: updateTransportServiceDto.company,
        },
      });

      if (!company)
        throw new NotFoundException(`Company with id ${updateTransportServiceDto.company} not found`);

      updatedTransportService.company = company;
    }

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
