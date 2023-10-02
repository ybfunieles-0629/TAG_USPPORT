import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ClientsService {
  private readonly logger: Logger = new Logger('ClientsService');

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createClientDto: CreateClientDto) {
    const newClient = plainToClass(Client, createClientDto);

    const user = await this.userRepository.findOne({
      where: {
        id: createClientDto.user,
      },
      relations: [
        'admin',
        'client',
        'supplier',
      ],
    });

    if (!user)
      throw new NotFoundException(`User with id ${createClientDto.user} not found`);

    if (user.client || user.admin || user.supplier)
      throw new BadRequestException(`This user is already linked with a client, admin or supplier`);

    newClient.user = user;

    const addresses: Address[] = [];

    for (const addressId of createClientDto.addresses) {
      const address = await this.addressRepository.findOneBy({ id: addressId });

      if (!address)
        throw new NotFoundException(`Address with id ${address} not found`);

      addresses.push(address);
    }

    newClient.addresses = addresses;

    await this.clientRepository.save(newClient);

    return {
      newClient
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.clientRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'addresses'
      ]
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
    const client = await this.clientRepository.findOneBy({ id });

    if (!client) {
      throw new NotFoundException(`client with id ${id} not found`);
    }

    const updatedClient = plainToClass(Client, updateClientDto);

    if (updateClientDto.addresses) {
      const addresses: Address[] = [];

      for (const addressId of updateClientDto.addresses) {
        const address = await this.addressRepository.findOneBy({ id: addressId });

        if (!address)
          throw new NotFoundException(`Address with id ${addressId} not found`);

        if (!address.isActive)
          throw new BadRequestException(`Address with id ${addressId} is currently inactive`);

        addresses.push(address);
      }

      updatedClient.addresses = addresses;
    }

    Object.assign(client, updatedClient);

    await this.clientRepository.save(client);

    return {
      client,
    };
  }

  // async changeIsCoorporative(id: string) {
  //   const client = await this.clientRepository.findOneBy({ id });

  //   if (!client)
  //     throw new NotFoundException(`Client with id ${id} not found`);

  //   client.isCoorporative = !client.isCoorporative;

  //   return {
  //     client
  //   };
  // }

  async desactivate(id: string) {
    const client = await this.clientRepository.findOne({
      where: {
        id,
      },
      relations: [
        'user',
      ],
    });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    client.isActive = !client.isActive;

    const user = await this.userRepository.findOneBy({ id: client.user.id });

    user.isActive = !user.isActive;

    await this.userRepository.save(user);
    await this.clientRepository.save(client);

    return {
      client
    };
  }

  async remove(id: string) {
    const client = await this.clientRepository.findOne({
      where: {
        id
      },
      relations: [
        'addresses'
      ]
    });

    if (!client)
      throw new NotFoundException(`Client with id ${id} not found`);

    if (client.addresses)
      throw new BadRequestException(`The client has relation with addresses and can't be deleted`);

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
