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
    const emailInUse = await this.clientRepository.findOne({
      where: {
        billingEmail: createClientDto.billingEmail,
      },
    });

    if (emailInUse)
      throw new BadRequestException(`Billing email ${createClientDto.billingEmail} is currently in use`);

    const newClient = plainToClass(Client, createClientDto);

    const user = await this.userRepository.findOne({
      where: {
        id: createClientDto.user,
      },
    });

    if (!user)
      throw new NotFoundException(`User with id ${createClientDto.user} not found`);

    newClient.user = user;

    const addresses: Address[] = [];

    for (const addressId of createClientDto.addresses) {
      const address = await this.addressRepository.findOneBy({ id: addressId });

      if (!address)
        throw new NotFoundException(`Address with id ${address} not found`);

      addresses.push(address);
    }

    newClient.addresses = addresses;

    const brands: Brand[] = [];

    for (const brandId of createClientDto.brands) {
      const brand = await this.brandRepository.findOneBy({ id: brandId });

      if (!brand)
        throw new NotFoundException(`Brand with id ${brandId} not found`);

      brands.push(brand);
    }

    newClient.brands = brands;

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
        'addresses',
        'brands'
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

  // async update(id: string, updateClientDto: UpdateClientDto) {
  //   const client = await this.clientRepository.preload({
  //     id,
  //     ...updateClientDto
  //   });

  //   if (!client)
  //     throw new NotFoundException(`Client with id ${id} not found`);

  //   await this.clientRepository.save(client);
  // }

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
