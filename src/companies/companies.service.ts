import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
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
    const newCompany = plainToClass(Company, createCompanyDto);

    newCompany.ivaResponsable = +newCompany.ivaResponsable;
    newCompany.taxPayer = +newCompany.taxPayer;
    newCompany.selfRetaining = +newCompany.selfRetaining;

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

    console.log(newCompany)
    let codeError = "";
    let codeErrorMessage = "";
    try {
    const dataResult = await this.companyRepository.save(newCompany);
    console.log(dataResult)
    } catch (error) {
      console.log(error)
      console.log(error.driverError.code)
      codeError = error.driverError.code; 
      codeErrorMessage = error.driverError.sqlMessage; 
    }

    let mesaggeData = "Compañia registrada exitosamente";
    if(codeError == "ER_DUP_ENTRY"){
      mesaggeData = "Error, la compañia ya existe en la base de datos";
    }


    return {
      codeErrorMessage,
      newCompany
    };
  }









  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.companyRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: Company[] = await this.companyRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
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

    updatedCompany.ivaResponsable = +updatedCompany.ivaResponsable;
    updatedCompany.taxPayer = +updatedCompany.taxPayer;
    updatedCompany.selfRetaining = +updatedCompany.selfRetaining;

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
      accessKeyId: 'AKIARACQVPFRECVYXGCC',
      secretAccessKey: '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',
      region: 'us-east-1',
    });

    const s3 = new AWS.S3();

    const params = {
      Bucket: 'tag-storage-documents',
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
      accessKeyId: 'AKIARACQVPFRECVYXGCC',
      secretAccessKey: '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',
      region: 'us-east-1',
    });

    const s3 = new AWS.S3();

    const params = {
      Bucket: 'tag-storage-documents',
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
      accessKeyId: 'AKIARACQVPFRECVYXGCC',
      secretAccessKey: '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',
      region: 'us-east-1',
    });

    const s3 = new AWS.S3();

    for (const file in files) {
      const params = {
        Bucket: 'tag-storage-documents',
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