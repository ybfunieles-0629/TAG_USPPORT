import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class AdminService {
  private readonly logger: Logger = new Logger('AdminService');

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createAdminDto: CreateAdminDto) {
    const newAdminUser = plainToClass(Admin, createAdminDto);

    const user = await this.userRepository.findOne({
      where: {
        id: createAdminDto.user
      },
      relations: [
        'admin',
        'client',
        'supplier'
      ],
    });

    if (!user)
      throw new NotFoundException(`User with id ${createAdminDto.user} not found`);

    if (user.client || user.admin || user.supplier)
      throw new BadRequestException(`This user is already linked with a client, admin or supplier`);

    newAdminUser.user = user;

    await this.adminRepository.save(newAdminUser);

    for (const clientId of createAdminDto.clients) {
      const client = await this.clientRepository.findOneBy({ id: clientId });

      if (!client)
        throw new NotFoundException(`Client with id ${clientId} not found`);

      client.commercialId = newAdminUser.id;

      await this.clientRepository.save(client);
    }

    return {
      newAdminUser
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.adminRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let admin: Admin;

    if (isUUID(term)) {
      admin = await this.adminRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.adminRepository.createQueryBuilder();

      admin = await queryBuilder
        .where('LOWER(adminType) =:adminType', {
          adminType: term.toLowerCase(),
        })
        .getOne();
    }

    if (!admin)
      throw new NotFoundException(`Admin user with ${term} not found`);

    return {
      admin
    };
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOneBy({ id });

    if (!admin) {
      throw new NotFoundException(`Admin user with id ${id} not found`);
    }

    const updatedAdmin = plainToClass(Admin, updateAdminDto);

    Object.assign(admin, updatedAdmin);

    await this.adminRepository.save(admin);

    return {
      admin
    };
  }

  async desactivate(id: string) {
    const admin = await this.adminRepository.findOne({
      where: {
        id,
      },
      relations: [
        'user',
      ],
    });

    if (!admin)
      throw new NotFoundException(`admin with id ${id} not found`);

    admin.isActive = !admin.isActive;

    const user = await this.userRepository.findOneBy({ id: admin.user.id });

    user.isActive = !user.isActive;

    await this.userRepository.save(user);
    await this.adminRepository.save(admin);

    return {
      admin
    };
  }

  async remove(id: string) {
    const admin = await this.adminRepository.findOneBy({ id });

    if (!admin)
      throw new NotFoundException(`Admin user with id ${id} not found`);

    await this.adminRepository.remove(admin);

    return admin;
  }

  private handleDbExceptions(error: any) {

  }
}
