import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger('PermissionsService');
  
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) { }

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

  findAll() {
    return this.permissionRepository.find();
  }

  findOne(term: string) {
    return `This action returns a #${term} permission`;
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

  remove(id: string) {
    return `This action removes a #${id} permission`;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
