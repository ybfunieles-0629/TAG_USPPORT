import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateFinancingCostProfitDto } from './dto/create-financing-cost-profit.dto';
import { UpdateFinancingCostProfitDto } from './dto/update-financing-cost-profit.dto';
import { FinancingCostProfit } from './entities/financing-cost-profit.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class FinancingCostProfitsService {
  constructor(
    @InjectRepository(FinancingCostProfit)
    private readonly financingCostProfitRepository: Repository<FinancingCostProfit>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) { }

  async create(createFinancingCostProfitDto: CreateFinancingCostProfitDto) {
    const newFinancingCostProfit: FinancingCostProfit = plainToClass(FinancingCostProfit, createFinancingCostProfitDto);

    if (createFinancingCostProfitDto.systemConfig) {
      const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
        where: {
          id: createFinancingCostProfitDto.systemConfig,
        },
      });

      if (!systemConfig)
        throw new NotFoundException(`System config with id ${createFinancingCostProfitDto.systemConfig} not found`);

      if (!systemConfig.isActive)
        throw new BadRequestException(`System config with id ${createFinancingCostProfitDto.systemConfig} id currently inactive`);

      newFinancingCostProfit.systemConfig = systemConfig;
    };

    await this.financingCostProfitRepository.save(newFinancingCostProfit);

    return {
      newFinancingCostProfit
    };
  }

  async createMultiple(createFinancingCostProfits: CreateFinancingCostProfitDto[]) {
    const createdFinancingCostProfits: FinancingCostProfit[] = [];

    for (const createFinancingCostProfitDto of createFinancingCostProfits) {
      const newFinancingCostProfit: FinancingCostProfit = plainToClass(FinancingCostProfit, createFinancingCostProfitDto);

      if (createFinancingCostProfitDto.systemConfig) {
        const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
          where: {
            id: createFinancingCostProfitDto.systemConfig,
          },
        });

        if (!systemConfig)
          throw new NotFoundException(`System config with id ${createFinancingCostProfitDto.systemConfig} not found`);

        if (!systemConfig.isActive)
          throw new BadRequestException(`System config with id ${createFinancingCostProfitDto.systemConfig} id currently inactive`);

        newFinancingCostProfit.systemConfig = systemConfig;
      };

      const createdFinancingCostProfit: FinancingCostProfit = await this.financingCostProfitRepository.save(newFinancingCostProfit);

      createdFinancingCostProfits.push(createdFinancingCostProfit);
    };

    return {
      createdFinancingCostProfits
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.financingCostProfitRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const result: FinancingCostProfit[] = await this.financingCostProfitRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'systemConfig',
      ],
    });

    return {
      count,
      result
    };
  }

  async findOne(id: string) {
    const financingCostProfit: FinancingCostProfit = await this.financingCostProfitRepository.findOne({
      where: {
        id,
      },
      relations: [
        'systemConfig',
      ],
    });

    if (!financingCostProfit)
      throw new NotFoundException(`Financing cost profit with id ${id} not found`);

    return {
      financingCostProfit
    };
  }

  async update(id: string, updateFinancingCostProfitDto: UpdateFinancingCostProfitDto) {
    const financingCostProfit: FinancingCostProfit = await this.financingCostProfitRepository.findOne({
      where: {
        id,
      },
      relations: [
        'systemConfig',
      ],
    });

    const updatedFinancingCostProfit: FinancingCostProfit = plainToClass(FinancingCostProfit, updateFinancingCostProfitDto);

    if (updateFinancingCostProfitDto.systemConfig) {
      const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
        where: {
          id: updateFinancingCostProfitDto.systemConfig,
        },
      });

      if (!systemConfig)
        throw new NotFoundException(`System config with id ${updateFinancingCostProfitDto.systemConfig} not found`);

      if (!systemConfig.isActive)
        throw new BadRequestException(`System config with id ${updateFinancingCostProfitDto.systemConfig} id currently inactive`);

      updatedFinancingCostProfit.systemConfig = systemConfig;
    };

    Object.assign(financingCostProfit, updatedFinancingCostProfit);

    await this.financingCostProfitRepository.save(financingCostProfit);

    return {
      financingCostProfit
    };
  }

  async updateMultiple(updateFinancingCostProfits: UpdateFinancingCostProfitDto[]) {
    const updatedFinancingCostProfits: FinancingCostProfit[] = [];

    for (const updateFinancingCostProfitDto of updateFinancingCostProfits) {
      const financingCostProfit: FinancingCostProfit = await this.financingCostProfitRepository.findOne({
        where: {
          id: updateFinancingCostProfitDto.id,
        },
        relations: [
          'systemConfig',
        ],
      });

      const updatedFinancingCostProfit: FinancingCostProfit = plainToClass(FinancingCostProfit, updateFinancingCostProfitDto);

      if (updateFinancingCostProfitDto.systemConfig) {
        const systemConfig: SystemConfig = await this.systemConfigRepository.findOne({
          where: {
            id: updateFinancingCostProfitDto.systemConfig,
          },
        });

        if (!systemConfig)
          throw new NotFoundException(`System config with id ${updateFinancingCostProfitDto.systemConfig} not found`);

        if (!systemConfig.isActive)
          throw new BadRequestException(`System config with id ${updateFinancingCostProfitDto.systemConfig} id currently inactive`);

        updatedFinancingCostProfit.systemConfig = systemConfig;
      };

      Object.assign(financingCostProfit, updatedFinancingCostProfit);

      const updatedFinancingCostProfitDb: FinancingCostProfit = await this.financingCostProfitRepository.save(financingCostProfit);

      updatedFinancingCostProfits.push(updatedFinancingCostProfitDb);
    }

    return {
      updatedFinancingCostProfits
    };
  }

  async desactivate(id: string) {
    const { financingCostProfit } = await this.findOne(id);

    financingCostProfit.isActive = !financingCostProfit.isActive;

    await this.financingCostProfitRepository.save(financingCostProfit);

    return {
      financingCostProfit
    };
  }

  async remove(id: string) {
    const { financingCostProfit } = await this.findOne(id);

    await this.financingCostProfitRepository.remove(financingCostProfit);

    return {
      financingCostProfit
    };
  }
}
