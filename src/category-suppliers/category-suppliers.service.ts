import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';
import { CategorySupplier } from './entities/category-supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoryTag } from '../category-tag/entities/category-tag.entity';
import axios from 'axios';

@Injectable()
export class CategorySuppliersService {
  private readonly logger: Logger = new Logger('CategorySuppliersService');

  constructor(
    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,
  ) { }

  async loadCategoriesFromExtApi() {
    const apiUrl = 'http://44.194.12.161/marpico/categorias';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const apiUrlWithApiKey = `${apiUrl}?apiKey=${apiKey}`;

    const { data } = await axios.get(apiUrlWithApiKey);

    const categories: CategorySupplier[] = data?.categorias?.map(({ jerarquia, nombre }) => (
      {
        offsprintType: 'Padre',
        name: nombre,
        description: '',
        categoryMargin: '',
        featured: 0,
        image: '',
        mainCategory: '',
        parentCategory: '',
        apiReferenceId: jerarquia,
        origin: 'Promos'
      }
    ));

    const categoriesInDb = await this.categorySupplierRepository.find();
    const categoriesToSave: CategorySupplier[] = [];

    for (const category of categories) {
      if (categoriesInDb.find(categoryInDb => categoryInDb.name == category.name || categoryInDb.apiReferenceId == category.apiReferenceId)) {
        console.log(`Category with name ${category.name} or apiReferenceId ${category.apiReferenceId} already registered`);
      } else {
        await this.categorySupplierRepository.save(category);
        categoriesToSave.push(category);
      }
    }

    if (categoriesToSave.length === 0) {
      throw new BadRequestException(`There are no new categories to save`);
    }

    return {
      categoriesToSave
    };
  }

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
