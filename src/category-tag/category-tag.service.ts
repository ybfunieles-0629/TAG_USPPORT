import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { CategoryTag } from './entities/category-tag.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoryTagService {
  private readonly logger: Logger = new Logger('CategoryTagService');

  constructor(
    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,
  ) { }

  async create(createCategoryTagDto: CreateCategoryTagDto, file: Express.Multer.File) {
    createCategoryTagDto.featured = +createCategoryTagDto.featured;

    const newCategoryTag = plainToClass(CategoryTag, createCategoryTagDto);

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      newCategoryTag.image = file.originalname;
    }

    await this.categoryTagRepository.save(newCategoryTag);

    return {
      newCategoryTag,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.categoryTagRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const categoryTag = await this.categoryTagRepository.findOneBy({ id });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${id} not found`);

    return {
      categoryTag
    };
  }

  async update(id: string, updateCategoryTagDto: UpdateCategoryTagDto, file: Express.Multer.File) {
    const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
      where: {
        id
      },
    });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${id} not found`);

    updateCategoryTagDto.featured = +updateCategoryTagDto.featured;

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      categoryTag.image = file.originalname;
    }

    const updatedCategoryTag = plainToClass(CategoryTag, updateCategoryTagDto);

    Object.assign(categoryTag, updatedCategoryTag);

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async desactivate(id: string) {
    const { categoryTag } = await this.findOne(id);

    categoryTag.isActive = !categoryTag.isActive;

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async changeFeatured(id: string) {
    const { categoryTag } = await this.findOne(id);

    categoryTag.featured == 1 ? categoryTag.featured = 0 : categoryTag.featured = 1;

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async remove(id: string) {
    const { categoryTag } = await this.findOne(id);

    await this.categoryTagRepository.remove(categoryTag);

    return {
      categoryTag
    };
  }

  private async uploadToAws(file: Express.Multer.File) {
    AWS.config.update({
      accessKeyId: 'AKIAT4TACBZFK2MS62VU',
      secretAccessKey: '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',
      region: 'us-east-2',
    });

    const s3 = new AWS.S3();

    const params = {
      Bucket: 'tag-support-storage',
      Key: file.originalname,
      Body: file.buffer,
    }

    return new Promise<string>((resolve, reject) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      })
    })
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
