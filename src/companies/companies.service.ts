import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class CompaniesService {
  private readonly logger: Logger = new Logger('CompaniesService');

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) { }

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const company = this.companyRepository.create(createCompanyDto);

      await this.companyRepository.save(company);

      return {
        company
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.companyRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let company: Company;

    if (isUUID(term)) {
      company = await this.companyRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.companyRepository.createQueryBuilder();

      company = await queryBuilder
        .where('LOWER(name) =: name', {
          name: term.toLowerCase(),
        })
        .getOne();
    }

    if (!company)
      throw new NotFoundException(`Company with ${term} not found`);

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyRepository.preload({
      id,
      ...updateCompanyDto
    });

    if (!company)
      throw new NotFoundException(`Company with id ${id} not found`);

    await this.companyRepository.save(company);

    return company;
  }

  async remove(id: string) {
    const company = await this.findOne(id);

    await this.companyRepository.remove(company);

    return {
      company
    }
  }

  private handleDbExceptions(error) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}