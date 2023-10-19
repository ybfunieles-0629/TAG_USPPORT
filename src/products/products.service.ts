import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from 'src/colors/entities/color.entity';


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

    await this.productRepository.save(newProduct);

    return {
      newProduct
    };
  }

  async createMultiple(createMultipleProducts: CreateProductDto[]) {
    const createdProducts = [];

    for (const createProductDto of createMultipleProducts) {
      const newProduct = plainToClass(Product, createProductDto);

      const colors: Color[] = [];

      if (createProductDto.colors) {
        for (const color of createProductDto.colors) {
          const colorInDb = await this.colorRepository.findOne({
            where: {
              id: color,
            },
          });

          if (!colorInDb)
            throw new NotFoundException(`Color with id ${color} not found`);

          colors.push(colorInDb);
        }
      }

      newProduct.colors = colors;

      await this.productRepository.save(newProduct);

      createdProducts.push(newProduct);
    }

    return {
      createdProducts,
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
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });

    const updatedProduct = plainToClass(Product, updateProductDto);

    Object.assign(product, updatedProduct);

    await this.productRepository.save(product);

    return {
      product
    };
  }

  async updateMultiple(updateMultipleProducts: UpdateProductDto[]) {
    const updatedProducts = [];

    for (const updateProductDto of updateMultipleProducts) {
      const product = await this.productRepository.findOne({
        where: {
          id: updateProductDto.id,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${updateProductDto.id} not found`);

      const updatedProduct = plainToClass(Product, updateProductDto);

      const colors: Color[] = [];

      if (updateProductDto.colors) {
        for (const color of updateProductDto.colors) {
          const colorInDb = await this.colorRepository.findOne({
            where: {
              id: color,
            },
          });

          if (!colorInDb)
            throw new NotFoundException(`Color with id ${color} not found`);

          colors.push(colorInDb);
        }
      }

      updatedProduct.colors = colors;

      Object.assign(product, updatedProduct)

      await this.productRepository.save(product);

      updatedProducts.push(product);
    }

    return {
      updatedProducts,
    };
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