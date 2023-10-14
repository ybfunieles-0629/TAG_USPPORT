import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RefProduct } from 'src/ref-products/entities/ref-product.entity';

@Injectable()
export class ProductsService {
  private readonly logger: Logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = plainToClass(Product, createProductDto);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createProductDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createProductDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${createProductDto.refProduct} is currently inactive`);

    newProduct.refProduct = refProduct;

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
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });

    const updatedProduct = plainToClass(Product, updateProductDto);

    
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updateProductDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updateProductDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${updateProductDto.refProduct} is currently inactive`);

    updatedProduct.refProduct = refProduct;

    Object.assign(product, updatedProduct);

    await this.productRepository.save(product);

    return {
      product
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