import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class AddressesService {
  private readonly logger: Logger = new Logger('AddressesService');

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) { }

  async create(createAddressDto: CreateAddressDto) {
    try {
      const address = this.addressRepository.create(createAddressDto);

      this.addressRepository.save(address);

      return {
        address
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.addressRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let address: Address;

    if (isUUID(term)) {
      address = await this.addressRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.addressRepository.createQueryBuilder();

      address = await queryBuilder
        .where('LOWER(address) =: address', {
          address: term.toLowerCase()
        })
        .getOne();
    }

    if (!address)
      throw new NotFoundException(`Address with ${term} not found`);

    return {
      address
    };
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressRepository.preload({ 
      id,
      ...updateAddressDto
    });

    if (!address)
      throw new NotFoundException(`Address with id ${id} not found`);

    await this.addressRepository.save(address);

    return {
      address
    };
  }

  async desactivate(id: string) {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address)
      throw new NotFoundException(`Address with id ${id} not found`);

    address.isActive = !address.isActive;

    return {
      address
    };
  }

  async remove(id: string) {
    const address = await this.addressRepository.findOneBy({ id });

    if (!address)
      throw new NotFoundException(`Address with id ${id} not found`);

    await this.addressRepository.remove(address);

    return {
      address
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
