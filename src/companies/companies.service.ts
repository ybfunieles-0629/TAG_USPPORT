import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { Company } from './entities/company.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger: Logger = new Logger('CompaniesService');

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async create(createCompanyDto: CreateCompanyDto, files: Record<string, Express.Multer.File>) {
    createCompanyDto.ivaResponsable = Boolean(createCompanyDto.ivaResponsable);
    createCompanyDto.taxPayer = Boolean(createCompanyDto.taxPayer);
    createCompanyDto.selfRetaining = Boolean(createCompanyDto.selfRetaining);

    try {
      const newCompany = plainToClass(Company, createCompanyDto);

      for (const [fieldName, fileInfo] of Object.entries(files)) {
        const uniqueFilename = `${uuidv4()}-${fileInfo[0].originalname}`;
        fileInfo[0].originalname = uniqueFilename;

        await this.uploadToAws(fileInfo[0]);

        if (fileInfo[0].fieldname === 'rutCompanyDocument') {
          newCompany.rutCompanyDocument = uniqueFilename;
        } else if (fileInfo[0].fieldname === 'dniRepresentativeDocument') {
          newCompany.dniRepresentativeDocument = uniqueFilename;
        } else if (fileInfo[0].fieldname === 'commerceChamberDocument') {
          newCompany.commerceChamberDocument = uniqueFilename;
        }
      }

      await this.companyRepository.save(newCompany);

      return {
        newCompany,
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.companyRepository.find({
      take: limit,
      skip: offset,
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

  async update(id: string, updateCompanyDto: UpdateCompanyDto, files: Record<string, Express.Multer.File>) {
    updateCompanyDto.ivaResponsable = Boolean(updateCompanyDto.ivaResponsable);
    updateCompanyDto.taxPayer = Boolean(updateCompanyDto.taxPayer);
    updateCompanyDto.selfRetaining = Boolean(updateCompanyDto.selfRetaining);

    if (updateCompanyDto.nit) {
      throw new BadRequestException(`You can't update the NIT of the company`);
    }

    const company = await this.companyRepository.findOne({
      where: {
        id,
      }
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    const updatedCompany = plainToClass(Company, updateCompanyDto);

    for (const [fieldName, fileInfo] of Object.entries(files)) {
      const uniqueFilename = `${uuidv4()}-${fileInfo[0].originalname}`;
      fileInfo[0].originalname = uniqueFilename;

      await this.uploadToAws(fileInfo[0]);

      if (fieldName === 'rutCompanyDocument') {
        updatedCompany.rutCompanyDocument = uniqueFilename;
      } else if (fieldName === 'dniRepresentativeDocument') {
        updatedCompany.dniRepresentativeDocument = uniqueFilename;
      } else if (fieldName === 'commerceChamberDocument') {
        updatedCompany.commerceChamberDocument = uniqueFilename;
      }
    }

    Object.assign(company, updatedCompany);

    await this.companyRepository.save(company);

    return {
      company
    };
  }

  async desactivate(id: string) {
    const company = await this.companyRepository.findOneBy({ id });

    if (!company)
      throw new NotFoundException(`Company with id ${id} not found`);

    company.isActive = !company.isActive;

    await this.companyRepository.save(company);

    return {
      company
    };
  }

  async remove(id: string) {
    const company = await this.companyRepository.findOne({
      where: {
        id
      }
    });

    await this.companyRepository.remove(company);

    return {
      company
    }
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

  async downloadFromAws(file: string, res: Response) {
    AWS.config.update({
      accessKeyId: 'AKIAT4TACBZFK2MS62VU',
      secretAccessKey: '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',
      region: 'us-east-2',
    });

    const s3 = new AWS.S3();

    const params = {
      Bucket: 'tag-support-storage',
      Key: file
    };

    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream.on('error', (err) => {
      this.handleDbExceptions(err);
    });

    s3Stream.pipe(res);
    return s3Stream;
  }

  async deleteFromAws(files: string[]) {
    AWS.config.update({
      accessKeyId: 'AKIAT4TACBZFK2MS62VU',
      secretAccessKey: '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',
      region: 'us-east-2',
    });

    const s3 = new AWS.S3();

    for (const file in files) {
      const params = {
        Bucket: 'tag-support-storage',
        Key: file
      };

      return new Promise<void>((resolve, reject) => {
        s3.deleteObject(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}