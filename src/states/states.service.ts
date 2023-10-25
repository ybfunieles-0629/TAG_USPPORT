import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entities/state.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createStateDto: CreateStateDto) {
    const newState = plainToClass(State, createStateDto);

    await this.stateRepository.save(newState);

    return {
      newState
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.stateRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const stateInDb = await this.stateRepository.findOne({
      where: {
        id,
      },
    });

    if (!stateInDb)
      throw new NotFoundException(`State with id ${id} not found`);

    return {
      stateInDb
    };
  }

  async update(id: string, updateStateDto: UpdateStateDto) {
    const stateInDb = await this.stateRepository.findOne({
      where: {
        id,
      },
    });

    if (!stateInDb)
      throw new NotFoundException(`State with id ${id} not found`);

    const updatedState = plainToClass(State, updateStateDto);

    Object.assign(stateInDb, updatedState);

    await this.stateRepository.save(stateInDb);
    
    return {
      stateInDb
    };
  }

  async desactivate(id: string) {
    const { stateInDb } = await this.findOne(id);

    stateInDb.isActive = !stateInDb.isActive;

    await this.stateRepository.save(stateInDb);

    return {
      stateInDb
    };
  }

  async remove(id: string) {
    const { stateInDb } = await this.findOne(id);

    await this.stateRepository.remove(stateInDb);

    return {
      stateInDb
    };
  }
}
