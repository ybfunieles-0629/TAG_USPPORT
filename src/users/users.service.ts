import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Company } from '../companies/entities/company.entity';
import { Role } from '../roles/entities/role.entity';
import { Access } from '../access/entities/access.entity';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    // @InjectRepository(Access)
    // private readonly accessRepository: Repository<Access>,
  ) { }

  async create(createUserDto: CreateUserDto) {
  //   const { password } = createUserDto;

  //   const newUser = plainToClass(User, createUserDto);

  //   const company = await this.companyRepository.findOne({
  //     where: {
  //       id: createUserDto.company
  //     }
  //   });

  //   if (!company)
  //     throw new NotFoundException(`Company with id ${createUserDto.company} not found`);

  //   if (!company.isActive)
  //     throw new BadRequestException(`The company isn't active`);

  //   newUser.company = company;

  //   const role = await this.roleRepository.findOne({
  //     where: {
  //       id: createUserDto.role
  //     }
  //   });

  //   if (!role)
  //     throw new NotFoundException(`Role with id ${createUserDto.role} not found`);

  //   if (!role.isActive)
  //     throw new BadRequestException(`The role isn't active`);

  //   newUser.role = role;

  //   const encryptedPassword = bcrypt.hashSync(password, 10);
    
  //   const access = this.accessRepository.create({
  //     email: newUser.email,
  //     password: encryptedPassword
  //   });
    
  //   access.role = role;

  //   await this.accessRepository.save(access);
    
  //   newUser.access = access;
    
  //   await this.userRepository.save(newUser);

  //   return {
  //     newUser,
  //     access
  //   }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.userRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'access',
        'access.roles',
        'company'
      ]
    });
  }

  async findOne(term: string) {
    let user: User;

    if (isUUID(term)) {
      user = await this.userRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder();

      user = await queryBuilder
        .where('LOWER(name) =:name', {
          name: term.toLowerCase(),
        })
        // .leftJoinAndSelect('user.company','userCompany')
        // .leftJoinAndSelect('user.role','userRole')
        .getOne();
    }

    if (!user)
      throw new NotFoundException(`User with ${term} not found`);

    return user;
  }

  //* IMPORTANTE
  //* IMPORTANTE
  //* IMPORTANTE
  // TODO: Verificar el tipo de dato del updateUserDto ya que da error, por ahora se deja en any
  async update(id: string, updateUserDto: any) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto
    });

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    if (updateUserDto.dni)
      throw new BadRequestException(`You can't update the dni of an user`);

    if (updateUserDto.company) {
      const company = await this.companyRepository.findOneBy({ id: updateUserDto.company });

      if (!company)
        throw new NotFoundException(`Company with id ${updateUserDto.company} not found`);

      user.company = company;
    }

    await this.userRepository.save(user);

    return user;
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);

      await this.userRepository.remove(user);

      return {
        user
      }
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async desactivate(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    user.isActive = !user.isActive;

    await this.userRepository.save(user);

    return {
      user
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
