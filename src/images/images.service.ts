import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class ImagesService {
  private readonly logger: Logger = new Logger('ImagesService');

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createImageDto: CreateImageDto, file: Express.Multer.File) {
    const newImage = plainToClass(Image, createImageDto);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createImageDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createImageDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${createImageDto.refProduct} is currently inactive`);

    newImage.refProduct = refProduct;

    let imageAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      newImage.url = file.originalname;
    }

    await this.imageRepository.save(newImage);

    return {
      imageAwsUrl,
      newImage,
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.imageRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'refProduct'
      ],
    });
  }

  async findOne(id: string) {
    const image = await this.imageRepository.findOne({
      where: {
        id,
      },
      relations: [
        'refProduct'
      ],
    });

    if (!image)
      throw new NotFoundException(`Image with id ${id} not found`);

    return {
      image
    };
  }

  async update(id: string, updateImageDto: UpdateImageDto, file: Express.Multer.File) {
    const image = await this.imageRepository.findOne({
      where: {
        id,
      },
      relations: [
        'refProduct'
      ],
    });

    if (!image)
      throw new NotFoundException(`Image with id ${id} not found`);

    const updatedImage = plainToClass(Image, updateImageDto);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updateImageDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updateImageDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${updateImageDto.refProduct} is currently inactive`);

    updatedImage.refProduct = refProduct;

    let imageAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      updatedImage.url = file.originalname;
    }

    Object.assign(image, updatedImage);

    await this.imageRepository.save(image);

    return {
      imageAwsUrl,
      image,
    };
  }

  async remove(id: string) {
    const { image } = await this.findOne(id);

    await this.imageRepository.remove(image);

    return {
      image
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

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
