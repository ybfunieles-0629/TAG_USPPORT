import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';

import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class BrandsService {
  private readonly logger: Logger = new Logger('BrandsService');

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async create(createBrandDto: CreateBrandDto) {
    try {
      const newBrand = plainToClass(Brand, createBrandDto);

      const existCompany = await this.companyRepository.findOneBy({ id: createBrandDto.companyId });

      if (!existCompany)
        throw new NotFoundException(`Company with id ${createBrandDto.companyId} not found`);

      if (!existCompany.isActive)
        throw new NotFoundException(`Company with id ${createBrandDto.companyId} is currently inactive`);

      await this.brandRepository.save(newBrand);

      return {
        newBrand
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async createMultipleBrands(createBrandsDto: CreateBrandDto[]) {
    const createdBrands: Brand[] = [];

    for (const createBrandDto of createBrandsDto) {
      const existBrand = await this.brandRepository.findOneBy({ name: createBrandDto.name });

      if (existBrand)
        throw new BadRequestException(`There is a brand with the name ${createBrandDto.name} already registered`);

      const existCompany = await this.companyRepository.findOneBy({ id: createBrandDto.companyId });

      if (!existCompany)
        throw new NotFoundException(`Company with id ${createBrandDto.companyId} not found`);

      if (!existCompany.isActive)
        throw new NotFoundException(`Company with id ${createBrandDto.companyId} is currently inactive`);

      const brand = this.brandRepository.create(createBrandDto);

      await this.brandRepository.save(brand);

      createdBrands.push(brand);
    }

    return {
      createdBrands,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const brands = await this.brandRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'user',
      ],
    });

    const brandsWithCompanyPromises = brands.map(async (brand) => {
      const company = await this.companyRepository.findOneBy({ id: brand.companyId });

      if (!company) {
        brand.companyId = null;
      }

      return {
        brand: brand,
        company: company,
      };
    });

    const brandsWithCompany = await Promise.all(brandsWithCompanyPromises);

    return brandsWithCompany;
  }

  async findOne(term: string) {
    let brand: Brand;

    if (isUUID(term)) {
      brand = await this.brandRepository.findOne({
        where: {
          id: term
        },
        relations: [
          'user',
        ],
      });
    } else {
      const queryBuilder = this.brandRepository.createQueryBuilder();

      brand = await queryBuilder
        .where('LOWER(name) =: name', {
          name: term.toLowerCase()
        })
        .getOne();
    }

    if (!brand)
      throw new NotFoundException(`Brand with ${term} not found`);

    const company = await this.companyRepository.findOne({
      where: {
        id: brand.companyId,
      },
    });

    if (!company)
      throw new NotFoundException(`Company with id ${brand.companyId} not found`);

    return {
      brand,
      company
    };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findOneBy({ id: id });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    if (updateBrandDto.name)
      brand.name = updateBrandDto.name;

    if (updateBrandDto.fee)
      brand.fee = updateBrandDto.fee;

    if (updateBrandDto.companyId) {
      const existCompany = await this.companyRepository.findOneBy({ id: updateBrandDto.companyId });

      if (!existCompany)
        throw new NotFoundException(`Company with id ${updateBrandDto.companyId} not found`);

      if (!existCompany.isActive)
        throw new NotFoundException(`Company with id ${updateBrandDto.companyId} is currently inactive`);

      brand.companyId = updateBrandDto.companyId;
    }

    await this.brandRepository.save(brand);

    return {
      brand,
    };
  }

  async updateMultipleBrands(updateBrandsDto: UpdateBrandDto[]) {
    const updatedBrands: Brand[] = [];

    for (const updateBrandDto of updateBrandsDto) {
      const { id, ...dataToUpdate } = updateBrandDto;

      const brand = await this.brandRepository.findOneBy({ id: updateBrandDto.id });

      if (!brand)
        throw new NotFoundException(`Brand with id ${updateBrandDto.id} not found`);

      const brandWithName = await this.brandRepository.findOne({
        where: {
          name: updateBrandDto.name
        },
      });

      if (brandWithName)
        throw new BadRequestException(`There is a brand with name ${updateBrandDto.name} already registered`);

      if (updateBrandDto.companyId) {
        const existCompany = await this.companyRepository.findOneBy({ id: updateBrandDto.companyId });

        if (!existCompany)
          throw new NotFoundException(`Company with id ${updateBrandDto.companyId} not found`);

        if (!existCompany.isActive)
          throw new NotFoundException(`Company with id ${updateBrandDto.companyId} is currently inactive`);

        brand.companyId = updateBrandDto.companyId;
      }

      Object.assign(brand, dataToUpdate);

      await this.brandRepository.save(brand);

      updatedBrands.push(brand);
    }

    return {
      updatedBrands
    };
  }

  async desactivate(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    brand.isActive = !brand.isActive;

    await this.brandRepository.save(brand);

    return {
      brand
    };
  }

  async remove(id: string) {
    const brand = await this.brandRepository.findOneBy({ id });

    if (!brand)
      throw new NotFoundException(`Brand with id ${id} not found`);

    await this.brandRepository.remove(brand);

    return {
      brand
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
