import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';

import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { CategoryTag } from './entities/category-tag.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class CategoryTagService {
  private readonly logger: Logger = new Logger('CategoryTagService');

  constructor(
    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @Inject('EMAIL_CONFIG') private emailSenderConfig,
  ) { }

  async requestCategory(createCategoryTagDto: CreateCategoryTagDto) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: ['puertodaniela586@gmail.com', 'locarr785@gmail.com', 'yeison.descargas@gmail.com'],
        subject: 'Solicitud de categoría Tag',
        html: `
          Nombre de la categoría: ${createCategoryTagDto.name} <br />
          Categoría TAG padre: ${createCategoryTagDto.parentCategory} <br />
          Descripción: ${createCategoryTagDto.description} <br />
        `,
      });

      return {
        msg: 'Email sended successfully'
      };
    } catch (error) {
      console.log('Failed to send the password recovery email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }
  }

  async sendMessage(sendMessageDto: SendMessageDto) { 
    try {
      if (!sendMessageDto.email || sendMessageDto.email.trim() == '')
        throw new BadRequestException(`You must enter a valid email`);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: [sendMessageDto.email],
        subject: 'Nuevo mensaje',
        html: `
          Nombre completo: ${sendMessageDto.name} <br />
          Asunto: ${sendMessageDto.subject} <br />
          Mensaje: ${sendMessageDto.message} <br />
        `,
      });

      return {
        msg: 'Email sended successfully'
      };
    } catch (error) {
      console.log('Failed to send the password recovery email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }
  }

  async create(createCategoryTagDto: CreateCategoryTagDto, file: Express.Multer.File) {
    createCategoryTagDto.featured = +createCategoryTagDto.featured;

    const newCategoryTag = plainToClass(CategoryTag, createCategoryTagDto);

    let imageAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      imageAwsUrl = imageUrl;

      newCategoryTag.image = file.originalname;
    }

    await this.categoryTagRepository.save(newCategoryTag);

    return {
      imageAwsUrl,
      newCategoryTag,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const totalCount = await this.categoryTagRepository.count();

    const { limit = totalCount, offset = 0 } = paginationDto;

    const categoryTags = await this.categoryTagRepository.find({
      take: limit,
      skip: offset,
    });

    const categoryCountsPromises = categoryTags.map(async (categoryTag) => {
      const count = await this.calculateCategoryCount(categoryTag);
      return {
        ...categoryTag,
        count,
      };
    });

    const categoryCounts = await Promise.all(categoryCountsPromises);

    return {
      totalCount,
      results: categoryCounts,
    };
  }

  private async calculateCategoryCount(categoryTag: CategoryTag): Promise<number> {
    const count = await this.refProductRepository.count({
      where: {
        tagCategory: categoryTag.name,
        categoryTags: categoryTag,
      },
    });

    return count;
  }

  async findOne(id: string) {
    const categoryTag = await this.categoryTagRepository.findOne({
      where: {
        id,
      },
      relations: [
        'categorySuppliers'
      ],
    });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${id} not found`);

    return {
      categoryTag
    };
  }

  async filterSubCategoryByParent(id: string) {
    const parentCategory: CategoryTag = await this.categoryTagRepository.findOne({
      where: {
        id,
      },
    });

    if (!parentCategory)
      throw new NotFoundException(`Parent category with id ${id} not found`);

    if (!parentCategory.mainCategory)
      throw new BadRequestException(`The category with id ${id} is not a parent category`);

    const subCategory: CategoryTag[] = await this.categoryTagRepository.find({
      where: {
        parentCategory: id,
      },
    });

    if (!subCategory)
      throw new NotFoundException(`Sub category with parent category ${id} not found`);

    return {
      subCategory
    };
  }

  async update(id: string, updateCategoryTagDto: UpdateCategoryTagDto, file: Express.Multer.File) {
    const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
      where: {
        id
      },
    });

    if (!categoryTag)
      throw new NotFoundException(`Category tag with id ${id} not found`);

    updateCategoryTagDto.featured = +updateCategoryTagDto.featured;

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      categoryTag.image = file.originalname;
    }

    const updatedCategoryTag = plainToClass(CategoryTag, updateCategoryTagDto);

    Object.assign(categoryTag, updatedCategoryTag);

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async desactivate(id: string) {
    const { categoryTag } = await this.findOne(id);

    categoryTag.isActive = !categoryTag.isActive;

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async changeFeatured(id: string) {
    const { categoryTag } = await this.findOne(id);

    categoryTag.featured == 1 ? categoryTag.featured = 0 : categoryTag.featured = 1;

    await this.categoryTagRepository.save(categoryTag);

    return {
      categoryTag
    };
  }

  async remove(id: string) {
    const { categoryTag } = await this.findOne(id);

    const offspringType: string = categoryTag.offspringType;
    const mainCategory: string = categoryTag.mainCategory;
    const parentCategory: string = categoryTag.parentCategory;

    if (categoryTag.categorySuppliers.length > 0)
      throw new BadRequestException(`You can't delete a category associated to a tag category`);

    if (mainCategory.trim() == '' || mainCategory == undefined || mainCategory == null && parentCategory.trim() == '' || parentCategory == undefined || parentCategory == null) {
      const categorySupplier: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          mainCategory: id,
        }
      });

      if (categorySupplier) {
        throw new BadRequestException(`You can't delete a category with main and parent category`);
      }
    };

    if (mainCategory.trim().length > 1 || mainCategory != undefined || mainCategory != null && parentCategory.trim() == '' || parentCategory == undefined || parentCategory == null) {
      const categorySupplier: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          parentCategory: id,
        },
      });

      if (categorySupplier) {
        throw new BadRequestException(`You can't delete a category with main and parent category`);
      }
    };

    await this.categoryTagRepository.remove(categoryTag);

    return {
      categoryTag
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
