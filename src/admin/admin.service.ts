import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  private readonly logger: Logger = new Logger('AdminService');

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createAdminDto: CreateAdminDto) {
    const newAdminUser = plainToClass(Admin, createAdminDto);

    const user = await this.userRepository.findOneBy({ id: createAdminDto.user });

    if (!user)
      throw new NotFoundException(`User with id ${createAdminDto.user} not found`);

    newAdminUser.user = user;

    await this.adminRepository.save(newAdminUser);

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

  // async update(id: string, updateAdminDto: UpdateAdminDto) {
  //   const admin = await this.adminRepository.preload({
  //     id,
  //     ...updateAdminDto,
  //   });

  //   if (!admin)
  //     throw new NotFoundException(`Admin user with id ${id} not found`);

  //   await this.adminRepository.save(admin);

  //   return {
  //     admin
  //   };
  // }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  private handleDbExceptions(error: any) {

  }
}
