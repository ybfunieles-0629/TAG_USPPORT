import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger('PermissionsService');

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) { }

  async seed() {
    const permissionsToSend = [
      {
        "name": "Empresas",
      },
      {
        "name": "Proveedores",
      },
      {
        "name": "Clientes",
      },
      {
        "name": "Comerciales",
      },
      {
        "name": "Productos",
      },
      {
        "name": "Marcacion",
      },
      {
        "name": "Transporte",
      },
      {
        "name": "Carrito compra",
      },
      {
        "name": "Pedidos",
      },
      {
        "name": "Gastos pedidos",
      },
      {
        "name": "Cotizaciones",
      },
      {
        "name": "Categorias",
      },
      {
        "name": "Usuarios",
      },
    ];

    for (const permissionToSend of permissionsToSend) {
      const permission = this.permissionRepository.create(permissionToSend);
    
      await this.permissionRepository.save(permission);
    };

    return {
      permissionsToSend
    };
  }

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = this.permissionRepository.create(createPermissionDto);

      await this.permissionRepository.save(permission);

      return {
        permission
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.permissionRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let permission: Permission;

    if (isUUID(term)) {
      permission = await this.permissionRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.permissionRepository.createQueryBuilder();

      permission = await queryBuilder
        .where('LOWER(name) =:name', {
          name: term.toLowerCase(),
        })
        .getOne();
    }

    if (!permission)
      throw new NotFoundException(`Permission with ${term} not found`);

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionDto
    });

    if (!permission)
      throw new NotFoundException(`Permission with id ${id} not found`);

    await this.permissionRepository.save(permission);

    return permission;
  }

  async remove(id: string) {
    const permission = await this.permissionRepository.findOneBy({ id });

    if (!permission)
      throw new NotFoundException(`Permission with id ${id} not found`);

    await this.permissionRepository.remove(permission);

    return permission;
  }

  async desactivate(id: string) {
    const permission = await this.permissionRepository.findOneBy({ id });

    if (!permission)
      throw new NotFoundException(`permission with id ${id} not found`);

    permission.isActive = !permission.isActive;

    await this.permissionRepository.save(permission);

    return {
      permission
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
