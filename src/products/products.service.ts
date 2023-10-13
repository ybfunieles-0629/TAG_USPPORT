import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Color } from '../colors/entities/color.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger: Logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = plainToClass(Product, createProductDto);

    const colors: Color[] = [];

    for (const colorId of createProductDto.colors) {
      const color = await this.colorRepository.findOne({
        where: {
          id: colorId,
        },
      });

      if (!color) 
        throw new NotFoundException(`Color with id ${colorId} not found`);

      colors.push(color);
    }

    newProduct.colors = colors;

    await this.productRepository.save(newProduct);

    return {
      newProduct
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    return {
      product
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

  }

  async desactivate(id: string) {
    const { product } = await this.findOne(id);

    product.isActive = !product.isActive;

    await this.productRepository.save(product);

    return {
      product
    };
  }

  async remove(id: string) {
    const { product } = await this.findOne(id);

    await this.productRepository.remove(product);

    return {
      product
    };
  }

  private handleDbExceptions(error: any) {
    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}


// Yeison