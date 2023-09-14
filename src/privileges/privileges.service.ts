import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { Privilege } from './entities/privilege.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PrivilegesService {
  private readonly logger: Logger = new Logger('PrivilegesService');

  constructor(
    @InjectRepository(Privilege)
    private readonly privilegeRepository: Repository<Privilege>
  ) { }

  async create(createPrivilegeDto: CreatePrivilegeDto) {
    try {
      const privilege = this.privilegeRepository.create(createPrivilegeDto);

      await this.privilegeRepository.save(privilege);

      return {
        privilege
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.privilegeRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let privilege: Privilege;

    if (isUUID(term)) {
      privilege = await this.privilegeRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.privilegeRepository.createQueryBuilder();

      privilege = await queryBuilder
        .where('LOWER(name) =: name', {
          name: term.toLowerCase(),
        })
        .getOne();
    }

    if (!privilege)
      throw new NotFoundException(`Privilege with ${term} not found`)

    return privilege;
  }

  async update(id: string, updatePrivilegeDto: UpdatePrivilegeDto) {
    try {
      const privilege = await this.privilegeRepository.preload({
        id,
        ...UpdatePrivilegeDto
      });

      if (!privilege)
        throw new NotFoundException(`Privilege with id ${id} not found`);

      await this.privilegeRepository.save(privilege);

      return privilege;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} privilege`;
  }

  private handleDbExceptions(error) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);


  }
}
