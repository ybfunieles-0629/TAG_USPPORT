import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { plainToClass } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Company } from '../companies/entities/company.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Privilege } from '../privileges/entities/privilege.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Privilege)
    private readonly privilegeRepository: Repository<Privilege>,

    private readonly jwtService: JwtService,
  ) { }

  async createUser(createUserDto: CreateUserDto) {
    const emailInUse = await this.userRepository.findOne({
      where: {
        email: createUserDto.email
      },
    });

    if (emailInUse)
      throw new BadRequestException(`User with email ${createUserDto.email} is already registered`);

    const dniInUse = await this.userRepository.findOne({
      where: {
        dni: createUserDto.dni,
      },
    });

    if (dniInUse)
      throw new BadRequestException(`User with dni ${createUserDto.dni} is already registered`);

    const newUser = plainToClass(User, createUserDto);

    const company = await this.companyRepository.findOneBy({ id: createUserDto.company });

    if (!company)
      throw new NotFoundException(`Company with id ${createUserDto.company} not found`);

    newUser.company = company;

    const roles: Role[] = [];
    const permissions: Permission[] = [];
    const privileges: Privilege[] = [];
    const brands: Brand[] = [];

    for (const roleId of createUserDto.roles) {
      const role = await this.roleRepository.findOneBy({ id: roleId });

      if (!role)
        throw new NotFoundException(`Role with id ${roleId} not found`);

      if (!role.isActive)
        throw new BadRequestException(`Role with id ${roleId} is currently inactive`);

      roles.push(role);
    }

    newUser.roles = roles;

    for (const permissionId of createUserDto.permissions) {
      const permission = await this.permissionRepository.findOneBy({ id: permissionId });

      if (!permission)
        throw new NotFoundException(`Permission with id ${permissionId} not found`);

      if (!permission.isActive)
        throw new BadRequestException(`Permission with id ${permissionId} is currently inactive`);

      permissions.push(permission);
    }

    newUser.permissions = permissions;

    for (const privilegeId of createUserDto.privileges) {
      const privilege = await this.privilegeRepository.findOneBy({ id: privilegeId });

      if (!privilege)
        throw new NotFoundException(`Privilege with id ${privilegeId} not found`);

      if (!privilege.isActive)
        throw new BadRequestException(`Privilege with id ${privilegeId} is currently inactive`);

      privileges.push(privilege);
    }

    newUser.privileges = privileges;;

    for (const brandId of createUserDto.brands) {
      const brand = await this.brandRepository.findOneBy({ id: brandId });

      if (!brand)
        throw new NotFoundException(`Brand with id ${brandId} not found`);

      if (!brand.isActive)
        throw new BadRequestException(`Brand with id ${brandId} is currently inactive`);

      brands.push(brand);
    }

    newUser.brands = brands;

    const encryptedPassword = bcrypt.hashSync(createUserDto.password, 10);

    newUser.password = encryptedPassword;

    await this.userRepository.save(newUser);

    return {
      newUser
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    let payloadToSend;

    const user = await this.userRepository.findOne({
      where: {
        email
      },
      relations: [
        'admin',
        'brands',
        'client',
        'client.addresses',
        'supplier',
        'company',
        'roles',
        'permissions',
        'privileges'
      ],
    });

    if (!user)
      throw new UnauthorizedException('Incorrect credentials');

    if (!user.isActive)
      throw new BadRequestException(`The user is currently inactive`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Incorrect credentials');

    if (user.roles.some(role => role.name.toLowerCase().trim() === 'administrador') || user.roles.some(role => role.name.toLowerCase().trim() === 'super-administrador')) {
      const { id: userId, name: username, dni, city, address } = user;
      const { id: companyId, billingEmail, nit } = user.company;

      payloadToSend = {
        user: { userId, username, dni, city, address },
        company: { companyId, billingEmail, nit },
        roles: user.roles.map(role => ({ name: role.name })),
        permissions: user.permissions.map(permission => (({ name: permission.name }))),
      };
    } else {
      payloadToSend = {
        client: user.client,
        roles: user.roles.map(role => ({ name: role.name })),
        permissions: user.permissions.map(permission => ({ name: permission.name })),
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

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.userRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'admin',
        'brands',
        'client',
        'client.addresses',
        'supplier',
        'company',
        'roles',
        'permissions',
        'privileges'
      ]
    });
  }

  async findOne(term: string) {
    let user: User;

    if (isUUID(term)) {
      user = await this.userRepository.findOne({
        where: {
          id: term
        },
        relations: [
          'admin',
          'brands',
          'client',
          'client.addresses',
          'supplier',
          'company',
          'roles',
          'permissions',
          'privileges'
        ]
      });
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
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: [
        'brands'
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedUser = plainToClass(User, updateUserDto);

    if (updateUserDto.brands) {
      const brands: Brand[] = [];

      for (const brandId of updateUserDto.brands) {
        const brand = await this.brandRepository.findOneBy({ id: brandId });

        if (!brand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (!brand.isActive)
          throw new BadRequestException(`Brand with id ${brandId} is currently inactive`);

        brands.push(brand);
      }

      updatedUser.brands = brands;
    }

    if (updateUserDto.roles) {
      const roles: Role[] = [];

      for (const roleId of updateUserDto.roles) {
        const role = await this.roleRepository.findOneBy({ id: roleId });

        if (!role)
          throw new NotFoundException(`Role with id ${roleId} not found`);

        if (!role.isActive)
          throw new BadRequestException(`Role with id ${roleId} is currently inactive`);

        roles.push(role);
      }

      updatedUser.roles = roles;
    }

    if (updateUserDto.permissions) {
      const permissions: Permission[] = [];

      for (const permissionId of updateUserDto.permissions) {
        const permission = await this.permissionRepository.findOneBy({ id: permissionId });

        if (!permission)
          throw new NotFoundException(`Permission with id ${permissionId} not found`);

        if (!permission.isActive)
          throw new BadRequestException(`Permission with id ${permissionId} is currently inactive`);

        permissions.push(permission);
      }

      updatedUser.permissions = permissions;
    }

    if (updateUserDto.privileges) {
      const privileges: Role[] = [];

      for (const privilegeId of updateUserDto.privileges) {
        const privilege = await this.privilegeRepository.findOneBy({ id: privilegeId });

        if (!privilege)
          throw new NotFoundException(`Privilege with id ${privilegeId} not found`);

        if (!privilege.isActive)
          throw new BadRequestException(`Privilege with id ${privilegeId} is currently inactive`);

        privileges.push(privilege);
      }

      updatedUser.privileges = privileges;
    }

    Object.assign(user, updatedUser);

    await this.userRepository.save(user);

    return {
      user
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: [
        'admin',
        'client',
        'supplier',
        'company',
        'roles',
        'permissions',
        'privileges'
      ],
    });

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    const company = await this.companyRepository.findOne({
      where: {
        id: user.company.id
      },
      relations: [
        'users'
      ],
    });

    if (!company)
      throw new NotFoundException(`Company with id ${user.company.id} not found`);

    company.users = company.users.filter(u => u.id !== id);

    await this.companyRepository.save(company);
    await this.userRepository.remove(user);

    return {
      user
    };
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
