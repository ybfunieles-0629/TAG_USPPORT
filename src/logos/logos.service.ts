import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';


import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { Logo } from './entities/logo.entity';
import { MarkingService } from '../marking-services/entities/marking-service.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import path from 'path';

@Injectable()
export class LogosService {
  constructor(
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,

    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,
  ) { }

  async create(createLogoDto: CreateLogoDto, files: Record<string, Express.Multer.File>) {
    const newLogo = plainToClass(Logo, createLogoDto);

    const markingService = await this.markingServiceRepository.findOne({
      where: {
        id: createLogoDto.markingService,
      },
    });

    if (!markingService)
      throw new NotFoundException(`Marking service with id ${createLogoDto.markingService} not found`);

    if (!markingService.isActive)
      throw new BadRequestException(`Marking service with id ${createLogoDto.markingService} is currently inactive`);

    newLogo.markingService = markingService;

    let imageAwsUrl: string = '';

    for (const [fieldName, fileInfo] of Object.entries(files)) {
        // if (
        //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.png' ||
        //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.jpg' ||
        //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.jpeg'
        // ) {
        //   throw new BadRequestException(`The file ${fileInfo[0].originalname} is not a valid image file`);
        // }

        const uniqueFilename = `${uuidv4()}-${fileInfo[0].originalname}`;
        fileInfo[0].originalname = uniqueFilename;

        await this.uploadToAws(fileInfo[0]);

        if (fileInfo[0].fieldname === 'logo') {
          newLogo.logo = uniqueFilename;
        } else if (fileInfo[0].fieldname === 'mounting') {
          newLogo.mounting = uniqueFilename;
        }
    }

    await this.logoRepository.save(newLogo);

    return {
      imageAwsUrl,
      newLogo,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.logoRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingService',
      ],
    });
  }

  async findOne(id: string) {
    const logo = await this.logoRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingService',
      ],
    });

    if (!logo)
      throw new NotFoundException(`Logo with id ${id} not found`);

    return {
      logo
    };
  }

  async update(id: string, updateLogoDto: UpdateLogoDto, files: Record<string, Express.Multer.File>) {
    const logo = await this.logoRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingService',
      ],
    });

    if (!logo)
      throw new NotFoundException(`Logo with id ${id} not found`);

    const updatedLogo = plainToClass(Logo, updateLogoDto);

    let imageAwsUrl: string = '';

    const markingService = await this.markingServiceRepository.findOne({
      where: {
        id: updateLogoDto.markingService,
      },
    });

    if (!markingService)
      throw new NotFoundException(`Marking service with id ${updateLogoDto.markingService} not found`);

    if (!markingService.isActive)
      throw new BadRequestException(`Marking service with id ${updateLogoDto.markingService} is currently inactive`);

    for (const [fieldName, fileInfo] of Object.entries(files)) {
      // if (
      //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.png' ||
      //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.jpg' ||
      //   path.extname(fileInfo[0].originalname).toLowerCase() !== '.jpeg'
      // ) {
      //   throw new BadRequestException(`The file ${fileInfo[0].originalname} is not a valid pdf file`);
      // }

      const uniqueFilename = `${uuidv4()}-${fileInfo[0].originalname}`;
      fileInfo[0].originalname = uniqueFilename;

      await this.uploadToAws(fileInfo[0]);

      if (fileInfo[0].fieldname === 'logo') {
        updatedLogo.logo = uniqueFilename;
      } else if (fileInfo[0].fieldname === 'mounting') {
        updatedLogo.mounting = uniqueFilename;
      }
    }

    updatedLogo.markingService = markingService;

    Object.assign(logo, updatedLogo);

    await this.logoRepository.save(logo);

    return {
      imageAwsUrl,
      logo
    };
  }

  async desactivate(id: string) {
    const { logo } = await this.findOne(id);

    logo.isActive = !logo.isActive;

    await this.logoRepository.save(logo);

    return {
      logo
    };
  }

  async remove(id: string) {
    const { logo } = await this.findOne(id);

    await this.logoRepository.remove(logo);

    return {
      logo
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

}
