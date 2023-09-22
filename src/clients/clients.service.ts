import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  private readonly logger: Logger = new Logger('ClientsService');

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async create(createClientDto: CreateClientDto) {
    try {
      const client = this.clientRepository.create(createClientDto);

      await this.clientRepository.save(client);

      return {
        client
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.clientRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let client: Client;

    if (isUUID(term)) {
      client = await this.clientRepository.findOneBy({ id: term });
    }

    const queryBuilder = this.clientRepository.createQueryBuilder();

    client = await queryBuilder
      .where('LOWER(name) =:name', {
        name: term.toLowerCase(),
      })
      .getOne();

    if (!client)
      throw new NotFoundException(`Client with ${term} not found`);

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientRepository.preload({
      id,
      ...updateClientDto
    });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    await this.clientRepository.save(client);
  }

  async changeIsCoorporative(id: string) {
    const client = await this.clientRepository.findOneBy({ id });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    client.isCoorporative = !client.isCoorporative;

    return {
      client
    };
  }

  async desactivate(id: string) {
    const client = await this.clientRepository.findOneBy({ id });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    client.isActive = !client.isActive;

    await this.clientRepository.save(client);

    return {
      client
    };
  }

  async remove(id: string) {
    const client = await this.clientRepository.findOneBy({ id });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    await this.clientRepository.remove(client);

    return client;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
