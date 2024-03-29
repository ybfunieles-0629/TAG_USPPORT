import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { UsersService } from 'src/users/users.service';

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

    private readonly usersService: UsersService,
  ) { }

  async seedAdmins() {
    const { usersSaved } = await this.usersService.seedUsers();

    const adminsSaved: Admin[] = [];

    for (const userSaved of usersSaved) {
      const newAdmin = {
        "adminType": "General",
        "adminDesc": "description for the admin",
        "user": userSaved,
        "clients": []
      };

      const adminSaved = await this.adminRepository.save(newAdmin);

      adminsSaved.push(adminSaved);
    }

    return {
      adminsSaved
    };
  }

  async create(createAdminDto: CreateAdminDto) {
    const newAdminUser: Admin = plainToClass(Admin, createAdminDto);

    const user: User = await this.userRepository.findOne({
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

    if (createAdminDto.clients) {
      const clients: Client[] = [];

      for (const clientId of createAdminDto.clients) {
        const client = await this.clientRepository.findOneBy({ id: clientId });

        if (!client)
          throw new NotFoundException(`Client with id ${clientId} not found`);

        clients.push(client);
      }

      newAdminUser.clients = clients;
    }

    await this.adminRepository.save(newAdminUser);

    return {
      newAdminUser
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.adminRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: Admin[] = await this.adminRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'clients',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(term: string) {
    let admin: Admin;

    if (isUUID(term)) {
      admin = await this.adminRepository.findOne({
        where: {
          id: term
        },
        relations: [
          'clients',
        ],
      });
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
    const admin: Admin = await this.adminRepository.findOneBy({ id });

    if (!admin) {
      throw new NotFoundException(`Admin user with id ${id} not found`);
    }

    const updatedAdmin: Admin = plainToClass(Admin, updateAdminDto);

    if (updateAdminDto.clients) {
      const clients: Client[] = [];

      for (const clientId of updateAdminDto.clients) {
        const client = await this.clientRepository.findOneBy({ id: clientId });

        if (!client)
          throw new NotFoundException(`Client with id ${clientId} not found`);

        clients.push(client);
      }

      updatedAdmin.clients = clients;
    }

    Object.assign(admin, updatedAdmin);

    await this.adminRepository.save(admin);

    return {
      admin
    };
  }

  async desactivate(id: string) {
    const admin: Admin = await this.adminRepository.findOne({
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

    const user: User = await this.userRepository.findOneBy({
      id: admin.user.id
    });

    user.isActive = !user.isActive;

    await this.userRepository.save(user);
    await this.adminRepository.save(admin);

    return {
      admin
    };
  }

  async remove(id: string) {
    const admin: Admin = await this.adminRepository.findOneBy({ id });

    if (!admin)
      throw new NotFoundException(`Admin user with id ${id} not found`);

    await this.adminRepository.remove(admin);

    return admin;
  }

  private handleDbExceptions(error: any) {

  }
}
