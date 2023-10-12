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

  //* ---- LOAD PARENT CATEGORIES FROM EXT API METHOD ---- *//
  private async loadParentCategories(categorias: any) {
    const cleanedParentCategories = [];
    const parentCategoriesToSave: CategorySupplier[] = [];

    const referenceIdApiSet = new Set();

    const parentCategoriesInDb = await this.categorySupplierRepository.find({
      where: {
        offspringType: 'Padre'
      }
    });

    for (const parentCategory of categorias) {
      if (!referenceIdApiSet.has(parentCategory.jerarquia)) {
        const newParentCategory = {
          offspringType: 'Padre',
          name: parentCategory.nombre,
          description: '',
          categoryMargin: '',
          featured: 0,
          image: '',
          mainCategory: '',
          parentCategory: '',
          apiReferenceId: parentCategory.jerarquia,
          origin: 'Marpico',
        };

        cleanedParentCategories.push(newParentCategory);

        referenceIdApiSet.add(parentCategory.jerarquia);
      }
    }

    for (const parentCategory of cleanedParentCategories) {
      if (parentCategoriesInDb.find(parentCategoryInDb => parentCategoryInDb.name == parentCategory.name || parentCategoryInDb.apiReferenceId == parentCategory.apiReferenceId)) {
        console.log(`Parent category with name ${parentCategory.name} or apiReferenceId ${parentCategory.apiReferenceId} already registered`);
      } else {
        await this.categorySupplierRepository.save(parentCategory);
        parentCategoriesToSave.push(parentCategory);
      }
    }

    if (parentCategoriesToSave.length === 0) {
      throw new BadRequestException(`There are no new parent categories to save`);
    }

    return {
      parentCategoriesToSave
    };
  }

  //* ---- LOAD SUB CATEGORIES FROM EXT API METHOD ---- *//
  private async loadSubCategories(data: any) {
    const groupedSubCategoriesData = {};
    const cleanedSubCategories = [];
    const subCategoriesSaved: CategorySupplier[] = [];

    const subCategoriesInDb: CategorySupplier[] = await this.categorySupplierRepository.find({
      where: {
        offspringType: 'Sub'
      },
    });

    const referenceIdApiSet = new Set();

    for (const item of data.jerarquiasNombres) {
      const firstPart = item.jerarquia.substring(0, 5);

      if (!groupedSubCategoriesData[firstPart]) {
        groupedSubCategoriesData[firstPart] = [];
      }

      if (!referenceIdApiSet.has(item.jerarquia)) {
        const newCategory = {
          offspringType: 'Sub',
          name: item.nombre,
          description: '',
          categoryMargin: '',
          featured: 0,
          image: '',
          mainCategory: firstPart,
          parentCategory: '',
          apiReferenceId: item.jerarquia,
          origin: 'Marpico',
        };

        cleanedSubCategories.push(newCategory);

        referenceIdApiSet.add(item.jerarquia);
      };
    };

    for (const subCategory of cleanedSubCategories) {
      const subCategoryExists = subCategoriesInDb.some(subCategoryDb => subCategoryDb.apiReferenceId == subCategory.apiReferenceId || subCategoryDb.name == subCategory.name);

      if (subCategoryExists) {
        console.log(`Sub category with name ${subCategory.name} or with api reference id ${subCategory.apiReferenceId} already exists on the database`);
      } else {
        const newSubCategory = await this.categorySupplierRepository.save(subCategory);
        subCategoriesSaved.push(newSubCategory);
      }
    }

    if (subCategoriesSaved.length === 0)
      throw new BadRequestException(`There are no new sub categories to save`);

    return {
      subCategoriesSaved
    };
  }

  async loadCategoriesFromExtApi() {
    const apiUrl = 'http://44.194.12.161/marpico/categorias';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const apiUrlWithApiKey = `${apiUrl}?apiKey=${apiKey}`;

    const { data } = await axios.get(apiUrlWithApiKey);

    // * ---- LOAD EVERYTHING ---- *//
    await this.loadParentCategories(data.categorias);
    await this.loadSubCategories(data);
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
