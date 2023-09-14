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

@Injectable()
export class AccessService {
  private readonly logger: Logger = new Logger('AccessService');

  constructor(
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { password } = createUserDto;

    const newUser = plainToClass(User, createUserDto);

    const company = await this.companyRepository.findOne({
      where: {
        id: createUserDto.company
      }
    });

    if (!company)
      throw new NotFoundException(`Company with id ${createUserDto.company} not found`);

    newUser.company = company;

    const role = await this.roleRepository.findOne({
      where: {
        id: createUserDto.role
      }
    });

    if (!role)
      throw new NotFoundException(`Role with id ${createUserDto.role} not found`);

    newUser.role = role;

    await this.userRepository.save(newUser);

    const encryptedPassword = bcrypt.hashSync(password, 10);

    const access = this.accessRepository.create({
      email: newUser.email,
      password: encryptedPassword
    });

    await this.accessRepository.save(access);

    return {
      newUser,
      access
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const access = await this.accessRepository.findOneBy({ email });

    if (!access)
      throw new UnauthorizedException('Incorrect credentials');

    if (!bcrypt.compareSync(password, access.password))
      throw new UnauthorizedException('Incorrect credentials');

    const user = await this.userRepository.findOne({
      where: {
        email
      },
      relations: {
        company: true,
        role: true
      }
    });

    const { id: userId, name: username, dni, city, address } = user;
    const { id: companyId, billingEmail, nit } = user.company;
    const { id: roleId, name: rolename } = user.role;

    const payloadToSend = {
      user: {
        userId,
        username,
        dni,
        city,
        address,
      },
      company: {
        companyId,
        billingEmail,
        nit
      },
      role: {
        roleId,
        rolename
      },
    };

    return {
      ...user,
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
