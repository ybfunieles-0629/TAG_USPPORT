import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { LoginUserDto } from './dto/login-user.dto';
import { Access } from './entities/access.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { Client } from '../clients/entities/client.entity';
import { AssignRolesDto } from './dto/assign-roles.dto';

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
        roles: true
      },
    });
  }

  async assignRolesToAccess(id: string, assignRolesDto: AssignRolesDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        access: true,
      },
    });

    const roles: Role[] = [];

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    const access = await this.accessRepository.findOneBy({ id: user.access.id });

    for (const roleId of assignRolesDto.rolesId) {
      const role = await this.roleRepository.findOneBy({ id: roleId });

      if (!role)
        throw new NotFoundException(`Role with id ${roleId} not found`);

      roles.push(role);
    }

    access.roles = roles;

    await this.accessRepository.save(access);

    return {
      access
    };
  }

  async signup(createClientDto: CreateClientDto) {
    const { password } = createClientDto;

    const emailInUse = await this.clientRepository.findOne({
      where: {
        contactPersonEmail: createClientDto.contactPersonEmail
      }
    });

    if (emailInUse)
      throw new BadRequestException(`Client with email ${createClientDto.contactPersonEmail} already registered`);

    const newClient = plainToClass(Client, createClientDto);

    const role = await this.roleRepository.findOne({
      where: {
        name: 'cliente'
      },
    });

    if (!role)
      throw new NotFoundException(`Role client not found`);

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const existAccess = await this.accessRepository.findOne({
      where: {
        email: newClient.contactPersonEmail
      }
    });

    if (existAccess)
      throw new BadRequestException(`Access with email ${newClient.contactPersonEmail} already registered`)

    try {
      const access = this.accessRepository.create({
        email: newClient.contactPersonEmail,
        password: encryptedPassword
      });

      access.roles.push(role);

      await this.accessRepository.save(access);

      newClient.access = access;

      await this.clientRepository.save(newClient);

      return {
        newClient,
        access
      }
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const { password } = createUserDto;

    const emailInUse = await this.userRepository.findOne({
      where: {
        email: createUserDto.email
      }
    });

    if (emailInUse)
      throw new BadRequestException(`User with email ${createUserDto.email} already registered`);

    const dniInUse = await this.userRepository.findOne({
      where: {
        dni: createUserDto.dni
      }
    });

    if (dniInUse)
      throw new BadRequestException(`User with dni ${createUserDto.dni} already registered`);

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

    const roles: Role[] = [];

    for (const roleId of createUserDto.roles) {
      const role = await this.roleRepository.findOneBy({ id: roleId });

      if (!role)
        throw new NotFoundException(`Role with id ${roleId} not found`);

      if (!role.isActive)
        throw new BadRequestException(`Role with id ${roleId} is currently inactive`);

      roles.push(role);
    }

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const existAccess = await this.accessRepository.findOne({
      where: {
        email: newUser.email
      }
    });

    if (existAccess)
      throw new BadRequestException(`Access with email ${newUser.email} already registered`)

    try {
      const access = this.accessRepository.create({
        email: newUser.email,
        password: encryptedPassword,
        roles
      });

      await this.accessRepository.save(access);

      newUser.access = access;

      await this.userRepository.save(newUser);

      return {
        newUser,
        access
      }
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    let payloadToSend;

    const access = await this.accessRepository.findOne({
      where: {
        email
      },
      relations: [
        'roles',
        'roles.permissions',
        'roles.privileges',
        'user',
        'client',
      ],
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

    const rolesToSend = access.roles.map(role => ({
      name: role.name,
      permissions: role.permissions.map(permission => ({
        name: permission.name
      })),
      privileges: role.privileges.map(privilege => ({
        name: privilege.name
      })),
    }));

    if (access.roles.some(role => role.name.toLowerCase().trim() === 'administrador') || access.roles.some(role => role.name.toLowerCase().trim() === 'super-administrador')) {
      const { id: userId, name: username, dni, city, address } = access.user;
      const { id: companyId, billingEmail, nit } = user.company;

      payloadToSend = {
        user: { userId, username, dni, city, address },
        company: { companyId, billingEmail, nit },
        roles: rolesToSend
      };
    } else {
      payloadToSend = {
        client: access.client,
        roles: rolesToSend
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
    console.log(error);

    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
