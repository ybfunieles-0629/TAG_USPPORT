import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Privilege } from './entities/privilege.entity';
import { Repository } from 'typeorm';

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

  async findAll() {
    return this.privilegeRepository.find();
  }

  findOne(term: string) {
    return `This action returns a #${term} privilege`;
  }

  async update(id: string, updatePrivilegeDto: UpdatePrivilegeDto) {
    const privilege = await this.privilegeRepository.preload({
      id,
      ...UpdatePrivilegeDto
    });

    if (!privilege)
      throw new NotFoundException(`Privilege with id ${id} not found`);

    await this.privilegeRepository.save(privilege);

    return privilege;
  }

  remove(id: number) {
    return `This action removes a #${id} privilege`;
  }

  private handleDbExceptions(error) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);


  }
}
