import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from '../colors/entities/color.entity';
import { VariantReference } from '../variant-reference/entities/variant-reference.entity';


@Injectable()
export class ProductsService {
  private readonly logger: Logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,

    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = plainToClass(Product, createProductDto);

    const variantReferences: VariantReference[] = [];

    if (createProductDto.variantReferences) {
      for (const variantReferenceId of createProductDto.variantReferences) {
        const variantReference = await this.variantReferenceRepository.findOne({
          where: {
            id: variantReferenceId,
          },
        });

        if (!variantReference)
          throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

        variantReferences.push(variantReference);
      }
    }

    newProduct.variantReferences = variantReferences;

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
      const variantReferences: VariantReference[] = [];

      if (createProductDto.variantReferences) {
        for (const variantReferenceId of createProductDto.variantReferences) {
          const variantReference = await this.variantReferenceRepository.findOne({
            where: {
              id: variantReferenceId,
            },
          });

          if (!variantReference)
            throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

          variantReferences.push(variantReference);
        }
      }

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

      newProduct.variantReferences = variantReferences;
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
      relations: [
        'colors',
        'variantReferences',
      ],
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id
      },
      relations: [
        'colors',
        'variantReferences',
      ],
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
      relations: [
        'colors',
        'variantReferences',
      ],
    });

    const updatedProduct = plainToClass(Product, updateProductDto);

    const variantReferences: VariantReference[] = [];

    if (updateProductDto.variantReferences) {
      for (const variantReferenceId of updateProductDto.variantReferences) {
        const variantReference = await this.variantReferenceRepository.findOne({
          where: {
            id: variantReferenceId,
          },
        });

        if (!variantReference)
          throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

        variantReferences.push(variantReference);
      }
    }

    updatedProduct.variantReferences = variantReferences;

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
        relations: [
          'colors',
          'variantReferences',
        ],
      });

      if (!product)
        throw new NotFoundException(`Product with id ${updateProductDto.id} not found`);

      const updatedProduct = plainToClass(Product, updateProductDto);

      const colors: Color[] = [];
      const variantReferences: VariantReference[] = [];

      if (updateProductDto.variantReferences) {
        for (const variantReferenceId of updateProductDto.variantReferences) {
          const variantReference = await this.variantReferenceRepository.findOne({
            where: {
              id: variantReferenceId,
            },
          });

          if (!variantReference)
            throw new NotFoundException(`Variant reference with id ${variantReferenceId} not found`);

          variantReferences.push(variantReference);
        }
      }

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

      updatedProduct.variantReferences = variantReferences;
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