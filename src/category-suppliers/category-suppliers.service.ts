import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';
import { CategorySupplier } from './entities/category-supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoryTag } from '../category-tag/entities/category-tag.entity';

@Injectable()
export class CategorySuppliersService {
  private readonly logger: Logger = new Logger('CategorySuppliersService');

  constructor(
    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,
  ) { }

  async create(createCategorySupplierDto: CreateCategorySupplierDto) {
    try {
      const newCategory = plainToClass(CategorySupplier, createCategorySupplierDto);

      const categoryTag = await this.categoryTagRepository.findOne({
        where: {
          id: createCategorySupplierDto.categoryTag
        },
      });

      if (!categoryTag)
        throw new NotFoundException(`Category tag with id ${createCategorySupplierDto.categoryTag} not found`);

      newCategory.categoryTag = categoryTag;

      await this.categorySupplierRepository.save(newCategory);

      return {
        categoryTag
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.categorySupplierRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'categoryTag'
      ],
    });
  }

  async findOne(id: string) {
    const categorySupplier = await this.categorySupplierRepository.findOne({
      where: {
        id,
      },
      relations: [
        'categoryTag'
      ],
    });

    if (!categorySupplier)
      throw new NotFoundException(`Category supplier with id ${id} not found`);

    return {
      categorySupplier
    };
  }

  update(id: string, updateCategorySupplierDto: UpdateCategorySupplierDto) {
    return `This action updates a #${id} categoryTag`;
  }

  async desactivate(id: string) {
    const { categorySupplier } = await this.findOne(id);

    categorySupplier.isActive = !categorySupplier.isActive;

    await this.categorySupplierRepository.save(categorySupplier);

    return {
      categorySupplier
    };
  }

  async remove(id: string) {
    const { categorySupplier } = await this.findOne(id);

    await this.categorySupplierRepository.remove(categorySupplier);

    return {
      categorySupplier
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
