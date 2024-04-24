import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateSuscriptionDto } from './dto/create-suscription.dto';
import { UpdateSuscriptionDto } from './dto/update-suscription.dto';
import { Suscription } from './entities/suscription.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SuscriptionsService {
  constructor(
    @InjectRepository(Suscription)
    private readonly suscriptionRepository: Repository<Suscription>,
  ) { }

  async create(createSuscriptionDto: CreateSuscriptionDto) {
    const newSuscription: Suscription = plainToClass(Suscription, createSuscriptionDto);

    await this.suscriptionRepository.save(newSuscription);

    return {
      newSuscription
    };
  };


  
  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.suscriptionRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: Suscription[] = await this.suscriptionRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
  };

  async findOne(id: string) {
    const suscription: Suscription = await this.suscriptionRepository.findOne({
      where: {
        id,
      },
    });

    if (!suscription)
      throw new NotFoundException(`Suscription with id ${id} not found`);

    return {
      suscription
    };
  };




  
  async update(id: string, updateSuscriptionDto: UpdateSuscriptionDto) {
    const suscription: Suscription = await this.suscriptionRepository.findOne({
      where: {
        id,
      },
    });

    console.log(updateSuscriptionDto)

    if (!suscription)
      throw new NotFoundException(`Suscription with id ${id} not found`);

    const updatedSuscription: Suscription = plainToClass(Suscription, updateSuscriptionDto);

    Object.assign(suscription, updatedSuscription);

    await this.suscriptionRepository.save(suscription);

    return {
      suscription
    };
  };





  async desactivate(id: string) {
    const { suscription } = await this.findOne(id);

    suscription.isActive = !suscription.isActive;

    await this.suscriptionRepository.save(suscription);

    return {
      suscription
    };
  };

  async remove(email: string) {
    const suscription: Suscription = await this.suscriptionRepository.findOne({
      where: {
        email,
      },
    });

    if (!suscription)
      throw new NotFoundException(`Suscription with email ${email} not found`);

    await this.suscriptionRepository.remove(suscription);

    return {
      suscription
    };
  };
}
