import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import axios from 'axios';

import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Color } from './entities/color.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class ColorsService {
  private readonly logger: Logger = new Logger('ColorsService');

  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async loadColors() {
    const apiUrl = `http://44.194.12.161/colores-unicos`;

    const { data } = await axios.get(apiUrl);

    const colorsToSave: Color[] = [];

    for (const color of data) {
      const existingColorInDb = await this.colorRepository
        .createQueryBuilder('color')
        .where('LOWER(color.name) =:colorName', { colorName: color.nombreColor.toLowerCase() })
        .getOne();

      const existingColor: boolean = colorsToSave.some((colorDb) => colorDb.name.trim().toLowerCase() == color.nombreColor.trim().toLowerCase());

      if (!existingColorInDb && !existingColor) {
        const newColor = {
          name: color.nombreColor,
          code: color.codigo,
        };

        const colorToSave = await this.colorRepository.save(newColor);

        colorsToSave.push(colorToSave);
      };
    }

    return {
      colorsToSave
    };
  }

  async create(createColorDto: CreateColorDto, file: Express.Multer.File) {
    const newColor = plainToClass(Color, createColorDto);

    let imageAwsUrl: string = '';

    if (file != null || file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      newColor.image = file.originalname;
    };

    if (createColorDto.refProducts) {
      const refProducts: RefProduct[] = [];

      for (const refProductId of createColorDto.refProducts) {
        const refProduct: RefProduct = await this.refProductRepository.findOne({
          where: {
            id: refProductId,
          },
        });

        if (!refProduct)
          throw new NotFoundException(`Ref product with id ${refProductId} not found`);

        if (!refProduct.isActive)
          throw new BadRequestException(`Ref product with id ${refProductId} is currently inactive`);

        refProducts.push(refProduct);
      };

      newColor.refProducts = refProducts;
    };

    await this.colorRepository.save(newColor);

    return {
      newColor
    };
  }

  async createMultiple(createMultipleColors: CreateColorDto[]) {
    const createdColors = [];

    for (const createColorDto of createMultipleColors) {
      const color: Color = plainToClass(Color, createColorDto);

      await this.colorRepository.save(color);

      createdColors.push(color);
    }

    return {
      createdColors,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.colorRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const colors: Color[] = await this.colorRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'product',
        'refProducts',
      ],
    });

    return {
      count,
      colors
    };
  }

  async findOne(id: string) {
    const color = await this.colorRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProducts',
      ],
    });

    if (!color)
      throw new NotFoundException(`Color with id ${id} not found`);

    return {
      color
    };
  }

  async findOneByRefProduct(id: string) {
    const colors: Color[] = await this.colorRepository
      .createQueryBuilder('color')
      .leftJoinAndSelect('color.refProducts', 'refProduct')
      .where('refProduct.id =:id', { id })
      .leftJoinAndSelect('color.product', 'product')
      .getMany();

    if (!colors)
      throw new NotFoundException(`Color with ref product id ${id} not found`);

    return {
      colors
    };
  }

  async update(id: string, updateColorDto: UpdateColorDto, file: Express.Multer.File) {
    const color = await this.colorRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProducts',
      ],
    });

    if (!color)
      throw new NotFoundException(`Color with id ${id} not found`);

    const updatedColor = plainToClass(Color, updateColorDto);

    if (file != null || file != undefined) {
      let imageAwsUrl: string = color.image;

      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      updatedColor.image = file.originalname;
    };

    if (updateColorDto.refProducts) {
      const refProducts: RefProduct[] = [];

      for (const refProductId of updateColorDto.refProducts) {
        const refProduct: RefProduct = await this.refProductRepository.findOne({
          where: {
            id: refProductId,
          },
        });

        if (!refProduct)
          throw new NotFoundException(`Ref product with id ${refProductId} not found`);

        if (!refProduct.isActive)
          throw new BadRequestException(`Ref product with id ${refProductId} is currently inactive`);

        refProducts.push(refProduct);
      };

      updatedColor.refProducts = refProducts;
    };

    Object.assign(color, updatedColor);

    await this.colorRepository.save(color);

    return {
      color
    };
  }

  async updateMultiple(updateMultipleColors: UpdateColorDto[]) {
    const updatedColors = [];

    for (const updateColorDto of updateMultipleColors) {
      const { id, ...dataToUpdate } = updateColorDto;

      const color = await this.colorRepository.findOne({
        where: {
          id,
        },
      });

      if (!color)
        throw new NotFoundException(`Color with id ${id} not found`);

      Object.assign(color, dataToUpdate);

      await this.colorRepository.save(color);

      updatedColors.push(color);
    }

    return {
      updatedColors,
    };
  }

  // async desactivate(id: string) {
  //   const { color } = await this.findOne(id);

  //   color.

  //   return {
  //     color
  //   };
  // }

  async remove(id: string) {
    const color: Color = await this.colorRepository.findOne({
      where: {
        id,
      },
    });

    await this.colorRepository.remove(color);

    return {
      color
    };
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

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
