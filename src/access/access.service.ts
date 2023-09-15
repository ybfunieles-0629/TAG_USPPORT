import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginUserDto } from './dto/login-user.dto';
import { Access } from './entities/access.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { plainToClass } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity';
import { Company } from 'src/companies/entities/company.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateClientDto } from 'src/clients/dto/create-client.dto';
import { Client } from 'src/clients/entities/client.entity';

@Injectable()
export class AccessService {
  private readonly logger: Logger = new Logger('AccessService');

  constructor(
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
  ) { }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.accessRepository.find({
      take: limit,
      skip: offset,
      relations: {
        role: true
      },
    });
  }

  async signup(createClientDto: CreateClientDto) {
    const { password } = createClientDto;

    const newClient = plainToClass(Client, createClientDto);

    const role = await this.roleRepository.findOne({
      where: {
        name: 'client'
      },
    });

    if (!role)
      throw new NotFoundException(`Role client not found`);

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const access = this.accessRepository.create({
      email: newClient.contactPersonEmail,
      password: encryptedPassword
    });

    access.role = role;

    await this.accessRepository.save(access);

    newClient.access = access;

    await this.clientRepository.save(newClient);

    return {
      newClient,
      access
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const { password } = createUserDto;

    const newUser = plainToClass(User, createUserDto);

    const company = await this.companyRepository.findOne({
      where: {
        id: createUserDto.company
      }
    });

    if (!company)
      throw new NotFoundException(`Company with id ${createUserDto.company} not found`);

    if (!company.isActive)
      throw new BadRequestException(`The company isn't active`);

    newUser.company = company;

    const role = await this.roleRepository.findOne({
      where: {
        id: createUserDto.role
      }
    });

    if (!role)
      throw new NotFoundException(`Role with id ${createUserDto.role} not found`);

    if (!role.isActive)
      throw new BadRequestException(`The role isn't active`);

    newUser.role = role;

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const access = this.accessRepository.create({
      email: newUser.email,
      password: encryptedPassword
    });

    access.role = role;

    await this.accessRepository.save(access);

    newUser.access = access;

    await this.userRepository.save(newUser);

    return {
      newUser,
      access
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    let payloadToSend;

    const access = await this.accessRepository.findOne({
      where: {
        email
      },
      relations: {
        role: true,
        user: true,
        client: true,
      },
    });

    if (!access)
      throw new UnauthorizedException('Incorrect credentials');

    const user = await this.userRepository.findOne({
      where: {
        id: access.user.id
      },
      relations: {
        company: true,
      },
    });

    if (!user)
      throw new NotFoundException(`User with id ${access.user.id} not found`);

    if (!bcrypt.compareSync(password, access.password))
      throw new UnauthorizedException('Incorrect credentials');

    if (access.role.name.toLowerCase().trim() === 'administrador' || access.role.name.toLowerCase().trim() === 'super-administrador') {
      const { id: userId, name: username, dni, city, address } = access.user;
      const { id: companyId, billingEmail, nit } = user.company;
      const { id: roleId, name: rolename } = access.role;
      
      payloadToSend = {
        user: { userId, username, dni, city, address },
        company: { companyId, billingEmail, nit },
        role: { roleId, rolename },
      };
    } else {
      payloadToSend = {
        client: access.client,
        role: access.role,
      };
    }

    return {
      token: this.getJwtToken(payloadToSend),
    }
  }

  private getJwtToken(payload: any) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    console.log(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
