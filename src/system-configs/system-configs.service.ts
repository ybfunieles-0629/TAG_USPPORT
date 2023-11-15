import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfig } from './entities/system-config.entity';
import { plainToClass } from 'class-transformer';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SystemConfigsService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) { }

  async create(createSystemConfigDto: CreateSystemConfigDto) {
    const newSystemConfig: SystemConfig = plainToClass(SystemConfig, createSystemConfigDto);

    await this.systemConfigRepository.save(newSystemConfig);

    return {
      newSystemConfig
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.systemConfigRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SystemConfig[] = await this.systemConfigRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'financingCostProfits'
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
      where: {
        id,
      },
      relations: [
        'financingCostProfits'
      ],
    });

    if (!systemConfig)
      throw new NotFoundException(`System config with id ${id} not found`);

    return {
      systemConfig
    };
  }

  async update(id: string, updateSystemConfigDto: UpdateSystemConfigDto) {
    const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
      where: {
        id,
      },
      relations: [
        'financingCostProfits'
      ],
    });

    if (!systemConfig)
      throw new NotFoundException(`System config with id ${id} not found`);

    const updatedSystemConfig: SystemConfig = plainToClass(SystemConfig, updateSystemConfigDto);

    Object.assign(systemConfig, updatedSystemConfig);

    await this.systemConfigRepository.save(systemConfig);

    return {
      systemConfig
    };
  }

  async desactivate(id: string) {
    const { systemConfig } = await this.findOne(id);

    systemConfig.isActive = !systemConfig.isActive;

    await this.systemConfigRepository.save(systemConfig);

    return {
      systemConfig
    };
  }

  async remove(id: string) {
    const { systemConfig } = await this.findOne(id);

    await this.systemConfigRepository.remove(systemConfig);

    return {
      systemConfig
    };
  }
}
