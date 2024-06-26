import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
  private readonly logger: Logger = new Logger('AddressesService');

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) { }




  async create(createAddressDto: CreateAddressDto, user: User) {
    console.log(createAddressDto)

    const newAddress = new Address();
    newAddress.country = createAddressDto.country;
    newAddress.city = createAddressDto.city;
    newAddress.address = createAddressDto.address;
    newAddress.postalCode = createAddressDto.postalCode;
    newAddress.gpsLocation = createAddressDto.gpsLocation;
    newAddress.deliveryAddress = createAddressDto.deliveryAddress;
    newAddress.isPrimary = createAddressDto.isPrimary;
    newAddress.mainAddress = createAddressDto.mainAddress;
    newAddress.clientUser = createAddressDto.clientId; // Asignar clientId a clientUser

    // Asignar el ID del usuario que crea la dirección a la propiedad createdBy de la entidad Address
    newAddress.createdBy = user.id;

    // Guardar la dirección en la base de datos
    const savedAddress = await this.addressRepository.save(newAddress);
    console.log(savedAddress)
    return {
      newAddress
    };
  }





  async findAll(paginationDto: PaginationDto, id: string) {
    const { limit = 10, offset = 0 } = paginationDto;
    const address = await this.addressRepository.find({ where: { clientUser: id } });
    return address;
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


  
  async findOneClient(id: string) {

    const addressTotal:any = await this.addressRepository.find({
      where: {
        clientUser: id, isPrimary:1
      },
    });

    if (!addressTotal)
      throw new NotFoundException(`Address with ${id} not found`);

    return {
      addressTotal
    };
  }

 


  async update(id: string, updateAddressDto: UpdateAddressDto, user: User) {
    const address: Address = await this.addressRepository.preload({
      id,
      ...updateAddressDto
    });

    const addressTotal:any = await this.addressRepository.find({
      where: {
        clientUser:address.clientUser
      },
    });

    for (const ad of addressTotal) {
        ad.isPrimary = 0;
        await this.addressRepository.save(ad);
    }

    if (!address)
      throw new NotFoundException(`Address with id ${id} not found`);
    address.updatedBy = user.id;
    await this.addressRepository.save(address);

    return {
      address
    };
  }



  async desactivate(id: string) {
    const address: Address = await this.addressRepository.findOneBy({ id });

    if (!address)
      throw new NotFoundException(`Address with id ${id} not found`);

    address.isActive = !address.isActive;

    return {
      address
    };
  }

  async remove(id: string) {
    const address: Address = await this.addressRepository.findOneBy({ id });

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
