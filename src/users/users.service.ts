import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { plainToClass } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersList } from './data/usersList';
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
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import * as nodemailer from 'nodemailer';
import { JwtStrategy } from './strategies/jwt.strategy';

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

    @Inject('EMAIL_CONFIG') private emailSenderConfig,

    private readonly jwtService: JwtService,
  ) { }

  async seedUsers() {
    const companyInDb: Company = await this.companyRepository.findOne({
      where: {
        name: 'Tag',
      },
    });

    if (!companyInDb)
      throw new NotFoundException(`Company Tag not found`);

    const roleInDb: Role = await this.roleRepository.findOne({
      where: {
        name: 'Super-Administrador',
      },
    });

    if (!roleInDb)
      throw new NotFoundException(`Role Super-Administrador not found`);

    const permissionsInDb: Permission[] = await this.permissionRepository.find();
    const privilegesInDb: Privilege[] = await this.privilegeRepository.find();

    const usersToSave = UsersList.map(({ password, company, privileges, permissions, roles, ...data }) => {
      return {
        ...data,
        company: companyInDb,
        roles,
        permissions: permissionsInDb,
        privileges: privilegesInDb,
        password: bcrypt.hashSync(password, 10),
      }
    });

    const usersSaved: User[] = [];

    for (const userToSave of usersToSave) {
      const userSaved = await this.userRepository.save(userToSave);

      usersSaved.push(userSaved);
    }

    return {
      usersSaved
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const emailInUse: User = await this.userRepository.findOne({
      where: {
        email: createUserDto.email
      },
    });

    if (emailInUse)
      throw new BadRequestException(`User with email ${createUserDto.email} is already registered`);

    const dniInUse: User = await this.userRepository.findOne({
      where: {
        dni: createUserDto.dni,
      },
    });

    if (dniInUse)
      throw new BadRequestException(`User with dni ${createUserDto.dni} is already registered`);

    const newUser: User = plainToClass(User, createUserDto);

    const company: Company = await this.companyRepository.findOneBy({ id: createUserDto.company });

    if (!company)
      throw new NotFoundException(`Company with id ${createUserDto.company} not found`);

    newUser.company = company;

    const roles: Role[] = [];
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

    if (createUserDto.permissions) {
      const permissions: Permission[] = [];

      for (const permissionId of createUserDto.permissions) {
        const permission: Permission = await this.permissionRepository.findOneBy({ id: permissionId });

        if (!permission)
          throw new NotFoundException(`Permission with id ${permissionId} not found`);

        if (!permission.isActive)
          throw new BadRequestException(`Permission with id ${permissionId} is currently inactive`);

        permissions.push(permission);
      }

      newUser.permissions = permissions;
    }

    if (createUserDto.privileges) {
      const privileges: Privilege[] = [];

      for (const privilegeId of createUserDto.privileges) {
        const privilege: Privilege = await this.privilegeRepository.findOneBy({ id: privilegeId });

        if (!privilege)
          throw new NotFoundException(`Privilege with id ${privilegeId} not found`);

        if (!privilege.isActive)
          throw new BadRequestException(`Privilege with id ${privilegeId} is currently inactive`);

        privileges.push(privilege);
      }

      newUser.privileges = privileges;;
    }

    for (const brandId of createUserDto.brands) {
      const brand: Brand = await this.brandRepository.findOneBy({ id: brandId });

      if (!brand)
        throw new NotFoundException(`Brand with id ${brandId} not found`);

      if (!brand.isActive)
        throw new BadRequestException(`Brand with id ${brandId} is currently inactive`);

      brands.push(brand);
    }

    if (newUser.roles.some(role => role.name === 'Super-Administrador')) {
      const permissions: Permission[] = await this.permissionRepository.find();

      newUser.permissions = permissions;
    }

    newUser.brands = brands;

    const encryptedPassword = bcrypt.hashSync(createUserDto.password, 10);

    newUser.password = encryptedPassword;

    await this.userRepository.save(newUser);

    try {
      // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: newUser.email,
        subject: 'Registro exitoso',
        text: 'Su registro ha sido exitoso, para ingresar en la aplicación debe irse al apartado de Iniciar sesión y luego debe dar click en recuperar contraseña.',
      });
    } catch (error) {
      console.log('Failed to send the password recovery email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

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

    const { id: userId, name: username, dni, city, address, isCoorporative, mainSecondaryUser, companyPosition } = user;
    const { id: companyId, billingEmail, nit, legalCapacity } = user.company;

    if (user.roles.some(role => role.name.toLowerCase().trim() === 'administrador') || user.roles.some(role => role.name.toLowerCase().trim() === 'super-administrador')) {
      payloadToSend = {
        user: { userId, username, dni, city, address, email, isCoorporative, mainSecondaryUser, companyPosition },
        company: { companyId, billingEmail, nit, legalCapacity },
        roles: user.roles.map(role => ({ name: role.name })),
        permissions: user.permissions.map(permission => (({ name: permission.name }))),
      };
    } else {
      payloadToSend = {
        user: { userId, username, dni, city, address, companyPosition },
        company: { companyId, billingEmail, nit },
        client: user.client,
        commercialId: user.client.commercialId,
        roles: user.roles.map(role => ({ name: role.name })),
        permissions: user.permissions.map(permission => ({ name: permission.name })),
      };
    }

    return {
      token: this.getJwtToken(payloadToSend),
    }
  }

  private getJwtToken(payload: any) {
    const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
    return token;
  }

  async sendPasswordRecoveryEmail(passwordRecovery: PasswordRecoveryDto) {
    if (!passwordRecovery.email)
      throw new BadRequestException(`The email is required`);

    const user = await this.userRepository.findOne({
      where: {
        email: passwordRecovery.email,
      },
    });

    if (!user)
      throw new NotFoundException(`User with email ${passwordRecovery.email} not found`);

    const token = this.getJwtToken({ email: user.email });
    const resetUrl = `https://tag-web-16776.web.app/auth/change-password?t=${token}`;
    const emailText = `Click the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`;

    try {
      // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: passwordRecovery.email,
        subject: 'Password recovery',
        text: emailText,
      });
    } catch (error) {
      console.log('Failed to send the password recovery email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

    return {
      msg: 'Email sended successfully',
    };
  }

  async passwordRecovery(passwordRecovery: PasswordRecoveryDto) {
    if (!passwordRecovery.password)
      throw new BadRequestException(`The password is required`);

    if (!passwordRecovery.token)
      throw new BadRequestException(`The token is required`);

    const data = this.jwtService.decode(passwordRecovery.token);

    const jwtStrategy = new JwtStrategy(this.userRepository);

    const user = await jwtStrategy.validate(data);

    const hashedPass = bcrypt.hashSync(passwordRecovery.password, 10);

    user.password = hashedPass;

    await this.userRepository.save(user);

    return {
      user
    };
  }

  async addPermissionsByUserRole(id: string) {
    const user: User = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: [
        'roles',
      ],
    });

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    const permissionsForEachRole = {
      Comercial: [
        {
          name: 'Usuarios',
        },
        {
          name: 'Clientes',
        },
      ],
      Cliente: [
        {
          name: 'Cotizaciones',
        },
        {
          name: 'Pedidos',
        },
      ],
      Proveedor: [
        {
          name: 'Productos',
        },
        {
          name: 'Pedidos',
        },
      ],
    };

    const userRoles: string[] = user.roles.map(role => role.name);

    const userPermissions: Permission[] = userRoles.reduce((permissions, roleName): Permission[] => {
      const rolePermissions = permissionsForEachRole[roleName];

      if (!rolePermissions) {
        throw new NotFoundException(`Permissions not found for role ${roleName}`);
      }

      rolePermissions.forEach(async permission => {
        const permissionInDb: Permission = await this.permissionRepository.findOne({
          where: {
            name: permission.name,
          },
        });

        if (!permissionInDb) {
          throw new NotFoundException(`Permission with name ${permission.name} not found`);
        }

        permissions.push(permissionInDb);
      });

      return permissions;
    }, []);

    user.permissions = userPermissions;

    await this.userRepository.save(user);

    return {
      user
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.userRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'admin',
        'admin.clients',
        'admin.clients.user',
        'brands',
        'client',
        'client.addresses',
        'supplier',
        'supplier.subSupplierProductType',
        'company',
        'roles',
        'permissions',
        'privileges'
      ]
    });
  }

  async getClientsByCommercial(id: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.client', 'client')
      .where('client.commercialId =: id', { id })
      .getOne();

    if (!user)
      throw new NotFoundException(`Clients not found for commercial user ${id}`);

    return {
      user
    };
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
          'admin.clients',
          'admin.clients.user',
          'brands',
          'client',
          'client.addresses',
          'supplier',
          'supplier.subSupplierProductType',
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

  async findByRole(role: string) {
    const users: User[] = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('LOWER(role.name) =:roleName', { roleName: role })
      .getMany();

    if (!users)
      throw new NotFoundException(`There are no users registered with role ${role}`);

    return {
      users
    };
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
    const user: User = await this.userRepository.findOne({
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

    const company: Company = await this.companyRepository.findOne({
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

  async changeIsAllowedStatus(id: string) {
    const user: User = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new NotFoundException(`User with id ${id} not found`);

    user.isAllowed == 0 ? user.isAllowed = 1 : user.isAllowed = 0;

    await this.userRepository.save(user);

    return {
      user
    };
  }

  async desactivate(id: string) {
    const user: User = await this.userRepository.findOneBy({ id });

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
