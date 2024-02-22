import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateStatusHistoryDto } from './dto/create-status-history.dto';
import { UpdateStatusHistoryDto } from './dto/update-status-history.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { StatusHistory } from './entities/status-history.entity';

@Injectable()
export class StatusHistoryService {
  constructor(
    @InjectRepository(StatusHistory)
    private readonly statusHistoryRepository: Repository<StatusHistory>,
  ) { }

  create(createStatusHistoryDto: CreateStatusHistoryDto) {
    return 'This action adds a new statusHistory';
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.statusHistoryRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: StatusHistory[] = await this.statusHistoryRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'user',
        'state',
      ],
    });

    return {
      count,
      results
    };
  };

  async findOne(id: string) {
    const statusHistory: StatusHistory = await this.statusHistoryRepository.findOne({
      where: {
        id,
      },
      relations: [
        'user',
        'state',
      ],
    });

    if (!statusHistory)
      throw new NotFoundException(`Status history with id ${id} not found`);

    return {
      statusHistory
    };
  };

  update(id: number, updateStatusHistoryDto: UpdateStatusHistoryDto) {
    return `This action updates a #${id} statusHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} statusHistory`;
  }
}
