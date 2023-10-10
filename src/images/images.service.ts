import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ImagesService {
  private readonly logger: Logger = new Logger('ImagesService');

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) { }

  async create(createImageDto: CreateImageDto) {
    try {
      const image = this.imageRepository.create(createImageDto);

      await this.imageRepository.save(image);

      return {
        image
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.imageRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const image = await this.imageRepository.findOne({
      where: {
        id,
      },
    });

    if (!image)
      throw new NotFoundException(`Image with id ${id} not found`);

    return {
      image
    };
  }

  async update(id: string, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  async remove(id: string) {
    const { image } = await this.findOne(id);

    await this.imageRepository.remove(image);

    return {
      image
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
