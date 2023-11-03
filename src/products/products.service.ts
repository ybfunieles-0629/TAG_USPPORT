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
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import axios from 'axios';


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

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async loadProducts() {
    const apiUrl = 'http://44.194.12.161/marpico/listado_productos';

    const { data: { results } } = await axios.get(apiUrl);

    const totalMaterials = [];
    const finalData = [];

    for (const result of results) {
      for (const material of result.materiales) {
        totalMaterials.push(material);
      }
    }

    for (const material of totalMaterials) {
      const colors: Color[] = [];
      
      const color: Color = await this.colorRepository.findOne({
        where: {
          name: material.color_nombre,
        },
      });

      if (!color)
        throw new NotFoundException(`Color with id ${material.color_nombre} not found`);
      
      colors.push(color);

      const newProduct = {
        variantReferences: [],
        colors,
        referencePrice: material.precio,
        promoDisccount: material.descuento,
        availableUnit: material.inventario_almacen[0].cantidad,
      }

      const createdProduct = this.productRepository.create(newProduct);

      // await this.productRepository.save(createdProduct);

      finalData.push(createdProduct);
    }

    return {
      finalData
    };
  }

  async create(createProductDto: CreateProductDto) {
    const lastProducts = await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (lastProducts[0] && lastProducts[0].tagSku.trim() !== ''.trim()) {
      let skuNumber: number = parseInt(lastProducts[0].tagSku.match(/\d+/)[0], 10);

      skuNumber++;

      const newTagSku = `SKU-${skuNumber}`;

      createProductDto.tagSku = newTagSku;
    } else {
      createProductDto.tagSku = 'SKU-1001';
    }

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

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createProductDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createProductDto.refProduct} not found`);

    newProduct.refProduct = refProduct;
    newProduct.variantReferences = variantReferences;

    await this.productRepository.save(newProduct);

    return {
      newProduct
    };
  }

  async createMultiple(createMultipleProducts: CreateProductDto[]) {
    const createdProducts = [];

    const lastProducts = await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });

    for (const createProductDto of createMultipleProducts) {
      if (lastProducts[0] && lastProducts[0].tagSku.trim() !== ''.trim()) {
        let skuNumber: number = parseInt(lastProducts[0].tagSku.match(/\d+/)[0], 10);

        skuNumber++;

        const newTagSku = `SKU-${skuNumber}`;

        createProductDto.tagSku = newTagSku;
      } else {
        createProductDto.tagSku = 'SKU-1001';
      }

      const newProduct = plainToClass(Product, createProductDto);

      const colors: Color[] = [];
      const variantReferences: VariantReference[] = [];

      const refProduct = await this.refProductRepository.findOne({
        where: {
          id: createProductDto.refProduct,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product with id ${createProductDto.refProduct} not found`);

      newProduct.refProduct = refProduct;

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
        'packings',
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
        'packings',
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

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updateProductDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updateProductDto.refProduct} not found`);

    updatedProduct.refProduct = refProduct;

    const variantReferences: VariantReference[] = [];
    const colors: Color[] = [];

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

      const refProduct = await this.refProductRepository.findOne({
        where: {
          id: updateProductDto.refProduct,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product with id ${updateProductDto.refProduct} not found`);

      updatedProduct.refProduct = refProduct;

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