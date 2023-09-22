import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Permission } from '../permissions/entities/permission.entity';
import { AssignToRoleDto } from './dto/assign-to-role.dto';
import { Privilege } from '../privileges/entities/privilege.entity';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RolesService');

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Privilege)
    private readonly privilegeRepository: Repository<Privilege>,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);

      await this.roleRepository.save(role);

      return {
        role
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async assignPermissions(id: string, assignToRoleDto: AssignToRoleDto) {
    let permissions: Permission[] = [];

    const role = await this.roleRepository.findOne({
      where: {
        id
      },
      relations: {
        permissions: true
      },
    });

    if (!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    for (const permissionId of assignToRoleDto.permissionsId) {
      const permission = await this.permissionRepository.findOneBy({ id: permissionId });

      if (!permission)
        throw new NotFoundException(`Permission with id ${permissionId} not found`);

      permissions.push(permission);
    }

    if (permissions.length <= 0)
      throw new BadRequestException(`There are no permissions to assign`);

    role.permissions = permissions;

    await this.roleRepository.save(role);

    return {
      role
    };
  }

  async assignPrivileges(id: string, assignToRoleDto: AssignToRoleDto) {
    const privileges: Privilege[] = [];

    const role = await this.roleRepository.findOne({
      where: {
        id
      },
      relations: {
        privileges: true
      },
    });

    if (!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    for (const privilegeId of assignToRoleDto.privilegesId) {
      const privilege = await this.privilegeRepository.findOneBy({ id: privilegeId });

      if (!privilege)
        throw new NotFoundException(`Privilege with id ${id} not found`);

      privileges.push(privilege);
    }

    if (privileges.length <= 0)
      throw new BadRequestException(`There are no privileges to assign`);

    role.privileges = privileges;

    await this.roleRepository.save(role);

    return {
      role
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.roleRepository.find({
      take: limit,
      skip: offset,
      relations: {
        permissions: true,
        privileges: true,
      },
    });
  }

  async findOne(term: string) {
    let role: Role;

    if (isUUID(term)) {
      role = await this.roleRepository.findOne({
        where: {
          id: term,
        },
        relations: {
          permissions: true,
          privileges: true,
        },
      });
    } else {
      const queryBuilder = this.roleRepository.createQueryBuilder();

      role = await queryBuilder
        .where('LOWER(name) =:name', {
          name: term.toLowerCase()
        })
        .getOne()
    }

    if (!role)
      throw new NotFoundException(`Role with ${term} not found`);

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.preload({
      id,
      ...updateRoleDto
    });

    if (!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    await this.roleRepository.save(role);

    return role;
  }

  async desactivate(id: string) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    role.isActive = !role.isActive;

    await this.roleRepository.save(role);

    return {
      role
    };
  }

  async remove(id: string) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role)
      throw new NotFoundException(`Role with id ${id} not found`);

    await this.roleRepository.remove(role);

    return role;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
