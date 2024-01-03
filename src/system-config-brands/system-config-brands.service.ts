import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { CreateSystemConfigBrandDto } from './dto/create-system-config-brand.dto';
import { UpdateSystemConfigBrandDto } from './dto/update-system-config-brand.dto';
import { SystemConfigBrand } from './entities/system-config-brand.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SystemConfigBrandsService {
  constructor(
    @InjectRepository(SystemConfigBrand)
    private readonly systemConfigBrandRepository: Repository<SystemConfigBrand>,
  ) { }

  async create(createSystemConfigBrandDto: CreateSystemConfigBrandDto, file: Express.Multer.File) {
    const newSystemConfigBrand: SystemConfigBrand = plainToClass(SystemConfigBrand, createSystemConfigBrandDto);

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      newSystemConfigBrand.logo = file.originalname;
    };

    await this.systemConfigBrandRepository.save(newSystemConfigBrand);

    return {
      newSystemConfigBrand
    };
  };

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.systemConfigBrandRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SystemConfigBrand[] = await this.systemConfigBrandRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
  };

  async findOne(id: string) {
    const systemConfigBrand: SystemConfigBrand = await this.systemConfigBrandRepository.findOne({
      where: {
        id,
      },
    });

    if (!systemConfigBrand)
      throw new NotFoundException(`System config brand with id ${id} not found`);

    return {
      systemConfigBrand
    };
  };

  async update(id: string, updateSystemConfigBrandDto: UpdateSystemConfigBrandDto, file: Express.Multer.File) {
    const systemConfigBrand: SystemConfigBrand = await this.systemConfigBrandRepository.findOne({
      where: {
        id,
      },
    });

    if (!systemConfigBrand)
      throw new NotFoundException(`System config brand with id ${id} not found`);

    const updatedSystemConfigBrand = plainToClass(SystemConfigBrand, updateSystemConfigBrandDto);

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      updatedSystemConfigBrand.logo = file.originalname;
    };

    Object.assign(systemConfigBrand, updatedSystemConfigBrand);

    await this.systemConfigBrandRepository.save(systemConfigBrand);

    return {
      systemConfigBrand
    };
  };

  async desactivate(id: string) {
    const { systemConfigBrand } = await this.findOne(id);

    systemConfigBrand.isActive = !systemConfigBrand.isActive;

    await this.systemConfigBrandRepository.save(systemConfigBrand);

    return {
      systemConfigBrand
    };
  };

  async remove(id: string) {
    const { systemConfigBrand } = await this.findOne(id);
  
    await this.systemConfigBrandRepository.remove(systemConfigBrand);

    return {
      systemConfigBrand
    };
  };

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
  };
}
