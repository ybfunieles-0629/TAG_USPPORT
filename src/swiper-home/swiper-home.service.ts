import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { plainToClass } from 'class-transformer';

import { CreateSwiperHomeDto } from './dto/create-swiper-home.dto';
import { UpdateSwiperHomeDto } from './dto/update-swiper-home.dto';
import { SwiperHome } from './entities/swiper-home.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SwiperHomeService {
  constructor(
    @InjectRepository(SwiperHome)
    private readonly swiperHomeRepository: Repository<SwiperHome>,
  ) { }

  async create(createSwiperHomeDto: CreateSwiperHomeDto, file: Express.Multer.File, user: User) {
    const newSwiperHome: SwiperHome = plainToClass(SwiperHome, createSwiperHomeDto);

    newSwiperHome.createdBy = user.id;

    let imageAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      newSwiperHome.url = file.originalname;
    };

    await this.swiperHomeRepository.save(newSwiperHome);

    return {
      newSwiperHome
    };
  };

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.swiperHomeRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SwiperHome[] = await this.swiperHomeRepository.find({
      take: limit,
      skip: offset,
    });

    return {
      count,
      results
    };
  };

  async findOne(id: string) {
    const swiperHome: SwiperHome = await this.swiperHomeRepository.findOne({
      where: {
        id,
      },
    });

    if (!swiperHome)
      throw new NotFoundException(`Swiper home with id ${id} not found`);

    if (!swiperHome.isActive)
      throw new BadRequestException(`Swiper home with id ${id} is currently inactive`);

    return {
      swiperHome
    };
  };

  async update(id: string, updateSwiperHomeDto: UpdateSwiperHomeDto, file: Express.Multer.File, user: User) {
    const swiperHome: SwiperHome = await this.swiperHomeRepository.findOne({
      where: {
        id,
      },
    });

    if (!swiperHome)
      throw new NotFoundException(`Swiper home with id ${id} not found`);

    if (!swiperHome.isActive)
      throw new BadRequestException(`Swiper home with id ${id} is currently inactive`);

    const updatedSwiperHome: SwiperHome = plainToClass(SwiperHome, updateSwiperHomeDto);

    updatedSwiperHome.updatedBy = user.id;

    let imageAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      updatedSwiperHome.url = file.originalname;
    };

    Object.assign(swiperHome, updatedSwiperHome);

    await this.swiperHomeRepository.save(swiperHome);

    return {
      swiperHome
    };
  };

  async desactivate(id: string) {
    const { swiperHome } = await this.findOne(id);

    swiperHome.isActive = !swiperHome.isActive;

    await this.swiperHomeRepository.save(swiperHome);

    return {
      swiperHome
    };
  };

  async remove(id: string) {
    const { swiperHome } = await this.findOne(id);

    await this.swiperHomeRepository.remove(swiperHome);

    return {
      swiperHome
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
