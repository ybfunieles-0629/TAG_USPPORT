import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';
import { CategorySupplier } from './entities/category-supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoryTag } from '../category-tag/entities/category-tag.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { User } from '../users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class CategorySuppliersService {
  private readonly logger: Logger = new Logger('CategorySuppliersService');

  constructor(
    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @Inject('EMAIL_CONFIG') private emailSenderConfig,
  ) { }

  //* ---- LOAD PARENT CATEGORIES FROM EXT API METHOD ---- *//
  private async loadParentCategories(api: string) {
    const apiUrl = `http://44.194.12.161/${api}`;
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const apiUrlWithApiKey = `${apiUrl}?apiKey=${apiKey}`;

    let data = [];

    if (api.toLowerCase().includes('marpico')) {
      const { data: { categorias } } = await axios.get(apiUrlWithApiKey);

      data = categorias;
    } else {
      const { data: dataFromPromos } = await axios.get(apiUrlWithApiKey);

      data = dataFromPromos.data.resultado;
    }

    const cleanedParentCategories = [];
    const parentCategoriesToSave: CategorySupplier[] = [];

    const referenceIdApiSet = new Set();

    const parentCategoriesInDb = await this.categorySupplierRepository.find({
      where: {
        offspringType: 'Padre'
      }
    });

    const origin = api.toLowerCase().includes('marpico') ? 'Marpico' : 'Promos';

    const userSupplier = await this.userRepository.findOne({
      where: {
        name: origin,
      },
      relations: [
        'supplier',
      ],
    });

    if (!userSupplier)
      throw new NotFoundException(`User supplier for origin ${origin} not found`);

    if (userSupplier.supplier == null || userSupplier.supplier == undefined)
      throw new BadRequestException(`The user is not a supplier`);

    //* CLEAN DATA
    for (const parentCategory of data) {
      if (origin === 'Marpico') {
        if (!referenceIdApiSet.has(parentCategory.jerarquia)) {
          const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
            where: {
              name: parentCategory.nombre,
            },
          });

          const newParentCategory = {
            offspringType: 'Principal',
            name: parentCategory.nombre,
            description: '',
            categoryMargin: '',
            featured: 0,
            image: '',
            mainCategory: '',
            parentCategory: '',
            apiReferenceId: parentCategory.jerarquia,
            supplier: userSupplier.supplier.id,
            origin,
            categoryTag: categoryTag || null,
          };

          cleanedParentCategories.push(newParentCategory);

          referenceIdApiSet.add(parentCategory.jerarquia);
        }
      } else {
        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            name: parentCategory.nombre,
          },
        });

        const newParentCategory = {
          offspringType: 'Principal',
          name: parentCategory.nombre,
          description: '',
          categoryMargin: '',
          featured: 0,
          image: '',
          mainCategory: '',
          parentCategory: '',
          apiReferenceId: parentCategory.id,
          supplier: userSupplier.supplier.id,
          categoryTag: categoryTag || null,
          origin
        }

        cleanedParentCategories.push(newParentCategory);
      }
    }

    //* SEARCH IF THERE IS A CATEGORY ALREADY REGISTERED IN THE DB
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

    const categoryNames: string[] = parentCategoriesToSave.map(category => category.name);
    const categoryNamesString: string = categoryNames.join(', ');

    try {
      // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: 'yeison.descargas@gmail.com',
        subject: 'Nuevas categorías',
        text: `
        Nuevas categorías registradas:
        ${categoryNamesString}
        `,
      });
    } catch (error) {
      console.log('Failed to send the email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

    return {
      parentCategoriesToSave
    };
  }

  //* ---- LOAD SUB CATEGORIES FROM EXT API METHOD ---- *//
  private async loadSubCategories(api: string) {
    const apiUrl = `http://44.194.12.161/${api}`;
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const apiUrlWithApiKey = `${apiUrl}?apiKey=${apiKey}`;

    let data = [];

    if (api.toLowerCase().includes('marpico')) {
      const { data: { jerarquiasNombres } } = await axios.get(apiUrlWithApiKey);

      data = jerarquiasNombres;
    } else {
      const { data: dataFromPromos } = await axios.get(apiUrlWithApiKey);

      data = dataFromPromos.data.resultado.filter(category => category.idParent != null);
    }

    const subCategoriesInDb: CategorySupplier[] = await this.categorySupplierRepository.find({
      where: {
        offspringType: 'Subcategoria',
      },
    });

    const origin = api.toLowerCase().includes('marpico') ? 'Marpico' : 'Promos';

    const userSupplier = await this.userRepository.findOne({
      where: {
        name: origin,
      },
      relations: [
        'supplier',
      ],
    });

    if (!userSupplier)
      throw new NotFoundException(`User supplier for origin ${origin} not found`);

    if (userSupplier.supplier == null || userSupplier.supplier == undefined)
      throw new BadRequestException(`The user is not a supplier`);

    const referenceIdApiSet = new Set();

    const cleanedSubCategories = [];
    const groupedSubCategories = [];
    const subCategoriesToSave = [];

    for (const subCategory of data) {
      let firstPart: string = '';

      if (origin === 'Marpico') {
        firstPart = subCategory.jerarquia.substring(0, 5);

        if (!groupedSubCategories[firstPart]) {
          groupedSubCategories[firstPart] = [];
        }

        if (!referenceIdApiSet.has(subCategory.jerarquia)) {
          const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
            where: {
              name: subCategory.nombre,
            },
          });

          const newCategory = {
            offspringType: 'Padre',
            name: subCategory.nombre,
            description: '',
            categoryMargin: '',
            featured: 0,
            image: '',
            mainCategory: firstPart,
            parentCategory: '',
            apiReferenceId: subCategory.jerarquia,
            supplier: userSupplier.supplier.id,
            categoryTag: categoryTag || null,
            origin,
          };

          cleanedSubCategories.push(newCategory);
          referenceIdApiSet.add(subCategory.jerarquia);
        }
      } else {
        firstPart = subCategory.idParent;

        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            name: subCategory.nombre,
          },
        });

        const newCategory = {
          offspringType: 'Padre',
          name: subCategory.nombre,
          description: '',
          categoryMargin: '',
          featured: 0,
          image: '',
          mainCategory: firstPart,
          parentCategory: '',
          apiReferenceId: subCategory.id,
          supplier: userSupplier.supplier.id,
          categoryTag: categoryTag || null,
          origin
        };

        cleanedSubCategories.push(newCategory);
      };
    };

    for (const subCategory of cleanedSubCategories) {
      const subCategoryExists = subCategoriesInDb.some(subCategoryDb => subCategoryDb.apiReferenceId == subCategory.apiReferenceId || subCategoryDb.name == subCategory.name);

      if (subCategoryExists) {
        console.log(`Sub category with name ${subCategory.name} or with api reference id ${subCategory.apiReferenceId} already exists on the database`);
      } else {
        const newSubCategory = await this.categorySupplierRepository.save(subCategory);
        subCategoriesToSave.push(newSubCategory);
      }
    }

    if (subCategoriesToSave.length === 0)
      throw new BadRequestException('There are no new sub categories to save');

    const categoryNames: string[] = subCategoriesToSave.map(category => category.name);
    const categoryNamesString: string = categoryNames.join(', ');

    try {
      // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: 'yeison.descargas@gmail.com',
        subject: 'Sub categorías nuevas',
        text: `
        Nuevas sub categorías registradas:
        ${categoryNamesString}
        `,
      });
    } catch (error) {
      console.log('Failed to send the email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

    return {
      subCategoriesToSave,
    };
  }


  async loadCategoriesFromExtApi() {
    // * ---- LOAD CATEGORIES FROM MARPICO ---- *//
    await this.loadParentCategories('marpico/categorias');
    await this.loadSubCategories('marpico/categorias');

    //* ---- LOAD CATEGORIES FROM PROMOS ---- *//
    await this.loadParentCategories('categorias');
    await this.loadSubCategories('categorias');
  }

  async create(createCategorySupplierDto: CreateCategorySupplierDto, user: User) {
    const newCategorySupplier = plainToClass(CategorySupplier, createCategorySupplierDto);

    newCategorySupplier.createdBy = user.id;

    const categoryTag = await this.categoryTagRepository.findOne({
      where: {
        id: createCategorySupplierDto.categoryTag
      },
    });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${createCategorySupplierDto.categoryTag} not found`);

    newCategorySupplier.categoryTag = categoryTag;

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: createCategorySupplierDto.supplier
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${createCategorySupplierDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${createCategorySupplierDto.supplier} is currently inactive`);

    newCategorySupplier.supplier = supplier;

    await this.categorySupplierRepository.save(newCategorySupplier);

    return {
      newCategorySupplier
    };
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const totalCount = await this.categorySupplierRepository.count();

    const { limit = totalCount, offset = 0 } = paginationDto;

    let categorySuppliers: CategorySupplier[] = [];

    if (user.roles.some((role: Role) => role.name.toLowerCase().trim() == 'proveedor')) {
      categorySuppliers = await this.categorySupplierRepository
        .createQueryBuilder('categorySupplier')
        .leftJoinAndSelect('categorySupplier.supplier', 'supplier')
        .leftJoinAndSelect('supplier.user', 'user')
        .where('user.id =:userId', { userId: user.id })
        .leftJoinAndSelect('categorySupplier.categoryTag', 'categoryTag')
        .leftJoinAndSelect('categorySupplier.refProducts', 'refProducts')
        .getMany();
    } else {
      categorySuppliers = await this.categorySupplierRepository.find({
        take: limit,
        skip: offset,
        relations: [
          'categoryTag',
          'supplier',
          'supplier.user',
          'refProducts',
        ],
      });
    }

    const categoryCountsPromises = categorySuppliers.map(async (categorySupplier) => {
      const count = await this.calculateCategoryCount(categorySupplier);
      return {
        ...categorySupplier,
        count,
      };
    });

    const categoryCounts = await Promise.all(categoryCountsPromises);

    return {
      totalCount,
      results: categoryCounts,
    };
  }

  private async calculateCategoryCount(categorySupplier: CategorySupplier): Promise<number> {
    const count = await this.refProductRepository.count({
      where: {
        categorySuppliers: categorySupplier,
        tagCategory: categorySupplier.mainCategory,
      },
    });

    return count;
  }

  async findByType(type: string) {
    const categorySuppliers: CategorySupplier[] = await this.categorySupplierRepository.find({
      where: {
        offspringType: type,
      },
      relations: [
        'categoryTag',
        'supplier',
        'supplier.user',
        'refProducts',
      ],
    });

    if (!categorySuppliers)
      throw new NotFoundException(`Categories with type ${type} not found`);

    return {
      categorySuppliers
    };
  }

  async findOne(id: string) {
    const categorySupplier = await this.categorySupplierRepository.findOne({
      where: {
        id,
      },
      relations: [
        'categoryTag',
        'supplier',
        'supplier.user',
        'refProducts'
      ],
    });

    if (!categorySupplier)
      throw new NotFoundException(`Category supplier with id ${id} not found`);

    return {
      categorySupplier
    };
  }

  async update(id: string, updateCategorySupplierDto: UpdateCategorySupplierDto, user: User) {
    const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
      where: {
        id
      },
      relations: [
        'categoryTag',
        'supplier',
        'supplier.user',
        'refProducts',
      ],
    });

    if (!categorySupplier)
      throw new NotFoundException(`Category supplier with id ${id} not found`);

    const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
      where: {
        id: updateCategorySupplierDto.categoryTag,
      },
    });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${updateCategorySupplierDto.categoryTag} not found`);

    // const refProduct: RefProduct = await this.refProductRepository

    const updatedCategorySupplier = plainToClass(CategorySupplier, updateCategorySupplierDto);

    updatedCategorySupplier.updatedBy = user.id;

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: updateCategorySupplierDto.supplier
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${updateCategorySupplierDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${updateCategorySupplierDto.supplier} is currently inactive`);

    updatedCategorySupplier.supplier = supplier;

    Object.assign(categorySupplier, updatedCategorySupplier);

    await this.categorySupplierRepository.save(categorySupplier);

    return {
      categorySupplier
    };
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

    const offspringType: string = categorySupplier.offspringType;
    const mainCategory: string = categorySupplier.mainCategory;
    const parentCategory: string = categorySupplier.parentCategory;

    if (categorySupplier.refProducts.length > 0)
      throw new BadRequestException(`You can't delete a category associated to a ref product`);

    if (categorySupplier.categoryTag)
      throw new BadRequestException(`You can't delete a category associated to a tag category`);

    if (mainCategory.trim() == '' || mainCategory == undefined || mainCategory == null && parentCategory.trim() == '' || parentCategory == undefined || parentCategory == null) {
      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          mainCategory: id,
        }
      });

      if (categorySupplier) {
        throw new BadRequestException(`You can't delete a category with main and parent category`);
      }

      return;
    };

    if (mainCategory.trim().length > 1 || mainCategory != undefined || mainCategory != null && parentCategory.trim() == '' || parentCategory == undefined || parentCategory == null) {
      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          parentCategory: id,
        },
      });

      if (categorySupplier) {
        throw new BadRequestException(`You can't delete a category with main and parent category`);
      }

      return;
    };

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
