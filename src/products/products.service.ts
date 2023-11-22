import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import axios from 'axios';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from '../colors/entities/color.entity';
import { VariantReference } from '../variant-reference/entities/variant-reference.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';
import { Image } from '../images/entities/image.entity';
import { User } from '../users/entities/user.entity';
import { MarkingServiceProperty } from 'src/marking-service-properties/entities/marking-service-property.entity';


@Injectable()
export class ProductsService {
  private readonly logger: Logger = new Logger('ProductsService');

  private readonly apiUrl: string = 'http://44.194.12.161';
  private readonly imagesUrl: string = 'https://catalogospromocionales.com';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  //* ---------- LOAD PROMOS PRODUCTS METHOD ---------- *//
  private async loadPromosProducts() {
    const { data: { categorias } } = await axios.get(`${this.apiUrl}/misproductos`);

    const user: User = await this.userRepository.findOne({
      where: {
        name: 'Promos',
      },
      relations: [
        'supplier',
      ],
    });

    if (!user)
      throw new NotFoundException(`User supplier for promos not found`);

    if (!user.supplier)
      throw new BadRequestException(`The user is not a supplier`);

    for (const product of categorias[0]) {
      const images: Image[] = [];

      const newImage = {
        url: `${this.imagesUrl}/${product.imageUrl}`,
      };

      const image: Image = this.imageRepository.create(newImage);
      const savedImage = await this.imageRepository.save(image);

      images.push(savedImage);

      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          apiReferenceId: product.idCategoria,
        },
      });

      if (!categorySupplier)
        throw new NotFoundException(`Category with id ${product.idCategoria} not found`);

      const newReference = {
        name: product.nombre,
        description: product.resumen,
        keywords: product.palabrasClaveSeo,
        markedDesignArea: product.descripcionProducto,
        images,
        referenceCode: product.referencia,
        mainCategory: categorySupplier.id,
        supplier: user.supplier,
      };

      const createdRefProduct: RefProduct = this.refProductRepository.create(newReference);
      const savedRefProduct: RefProduct = await this.refProductRepository.save(createdRefProduct);

      const lastProducts = await this.productRepository.find({
        order: { createdAt: 'DESC' },
      });

      let tagSku: string = '';

      if (lastProducts[0] && lastProducts[0].tagSku.trim() !== ''.trim()) {
        let skuNumber: number = parseInt(lastProducts[0].tagSku.match(/\d+/)[0], 10);

        skuNumber++;

        const newTagSku = `SKU-${skuNumber}`;

        tagSku = newTagSku;
      } else {
        tagSku = 'SKU-1001';
      }

      const newProduct = {
        tagSku,
        refProduct: savedRefProduct,
        referencePrice: product.precio1,
      };

      const createdProduct: Product = this.productRepository.create(newProduct);
      const savedProduct: Product = await this.productRepository.save(createdProduct);
    }
  }

  //* ---------- LOAD MARPICO PRODUCTS METHOD ---------- *//
  private async loadMarpicoProducts() {
    const apiUrl = 'https://marpicoprod.azurewebsites.net/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const config = {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    };

    const { data: { results } } = await axios.get(apiUrl, config);

    const products = [];
    const refProductsToSave = [];
    const cleanedRefProducts = [];

    const refProductsInDb = await this.refProductRepository.find();

    const user = await this.userRepository.findOne({
      where: {
        name: 'Marpico',
      },
      relations: [
        'supplier',
      ],
    });

    if (!user)
      throw new NotFoundException(`User supplier for marpico not found`);

    if (!user.supplier)
      throw new BadRequestException(`The user is not a supplier`);

    for (const item of results) {
      let keyword = '';

      if (item.etiquetas.length >= 1) {
        keyword = item.etiquetas[0].nombre;
      }

      if (item.etiquetas.length <= 0) {
        keyword = '';
      }

      if (item.etiquetas.length >= 2) {
        let joinedKeyword = '';

        item.etiquetas.forEach(etiqueta => {
          joinedKeyword = joinedKeyword + etiqueta.nombre + ';';
        });

        keyword = joinedKeyword;
      }

      const images: Image[] = [];

      for (const imagen of item.imagenes) {
        const newImage = {
          url: imagen.imagen.file,
        };

        const createdImage: Image = this.imageRepository.create(newImage);
        const savedImage: Image = await this.imageRepository.save(createdImage);

        images.push(savedImage);
      }

      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          apiReferenceId: item.subcategoria_1.categoria.jerarquia,
        },
      });

      if (!categorySupplier)
        throw new NotFoundException(`Category with id ${item.subcategoria_1.categoria.jerarquia} not found`);

      let newRefProduct = {
        name: item.descripcion_comercial,
        referenceCode: item.familia,
        shortDescription: item.descripcion_comercial,
        description: item.descripcion_larga,
        mainCategory: categorySupplier.id,
        keywords: keyword,
        large: +item.empaque_largo,
        width: +item.empaque_ancho,
        height: +item.empaque_alto,
        weight: +item.empaque_peso_bruto,
        importedNational: 1,
        markedDesignArea: item.area_impresion || '',
        supplier: user.supplier,
        personalizableMarking: 0,
        images
      }

      cleanedRefProducts.push(newRefProduct);

      for (const material of item.materiales) {
        const productImages: Image[] = [];

        material.imagenes.forEach(async imagen => {
          const image: Image = this.imageRepository.create({
            url: imagen.file,
          });

          await this.imageRepository.save(image);

          productImages.push(image);
        });

        const newProduct = {
          familia: item.familia,
          images: productImages,
          material,
        };

        products.push(newProduct);
      }
    }

    for (const refProduct of cleanedRefProducts) {
      const refProductExists = refProductsInDb.some(refProductInDb => refProductInDb.referenceCode == refProduct.referenceCode);

      if (refProductExists) {
        console.log(`Ref product with reference code ${refProduct.referenceCode} is already registered`);
      } else {
        await this.refProductRepository.save(refProduct);
        refProductsToSave.push(refProduct);
      }
    }

    // //* ---- LOAD PRODUCTS ---- *//
    for (const product of products) {
      const colors: Color[] = [];

      const color: Color = await this.colorRepository.findOne({
        where: {
          name: product.material.color_nombre,
        },
      });

      if (!color)
        throw new NotFoundException(`Color with id ${product.material.color_nombre} not found`);

      colors.push(color);

      const refProduct = await this.refProductRepository.findOne({
        where: {
          referenceCode: product.familia,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product for product with familia ${product.familia} not found`);

      const lastProducts = await this.productRepository.find({
        order: { createdAt: 'DESC' },
      });

      let tagSku: string = '';

      if (lastProducts[0] && lastProducts[0].tagSku.trim() !== ''.trim()) {
        let skuNumber: number = parseInt(lastProducts[0].tagSku.match(/\d+/)[0], 10);

        skuNumber++;

        const newTagSku = `SKU-${skuNumber}`;

        tagSku = newTagSku;
      } else {
        tagSku = 'SKU-1001';
      }

      const newProduct = {
        tagSku,
        variantReferences: [],
        colors,
        referencePrice: +product.material.precio,
        promoDisccount: parseFloat(product.material.descuento.replace('-', '')),
        availableUnit: product?.material?.inventario_almacen[0]?.cantidad,
        refProduct,
      };

      const createdProduct: Product = this.productRepository.create(newProduct);

      const savedProduct: Product = await this.productRepository.save(createdProduct);
    }


    if (refProductsToSave.length === 0)
      throw new BadRequestException(`There are no new products to save`);

    return {
      refProductsToSave
    };
  }

  //* ---------- LOAD ALL PRODUCTS FROM EXT APIS ---------- *//
  async loadProducts() {
    await this.loadMarpicoProducts();
    await this.loadPromosProducts();
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

    if (createProductDto.images) {
      const images: Image[] = [];

      for (const imageId of createProductDto.images) {
        const image: Image = await this.imageRepository.findOne({
          where: {
            id: imageId,
          },
        });

        images.push(image);
      };

      newProduct.images = images;
    }

    if (createProductDto.markingServiceProperties) {
      const markingServiceProperties: MarkingServiceProperty[] = [];

      for (const markingServicePropertyId of createProductDto.markingServiceProperties) {
        const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
          where: {
            id: markingServicePropertyId,
          },
        });

        if (!markingServiceProperty)
          throw new NotFoundException(`Marking service property with id ${markingServicePropertyId} not found`);

        if (!markingServiceProperty.isActive)
          throw new BadRequestException(`Marking service property with id ${markingServicePropertyId} is currently inactive`);

        markingServiceProperties.push(markingServiceProperty);
      }

      newProduct.markingServiceProperties = markingServiceProperties;
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

      if (createProductDto.images) {
        const images: Image[] = [];

        for (const imageId of createProductDto.images) {
          const image: Image = await this.imageRepository.findOne({
            where: {
              id: imageId,
            },
          });

          images.push(image);
        };

        newProduct.images = images;
      }

      if (createProductDto.markingServiceProperties) {
        const markingServiceProperties: MarkingServiceProperty[] = [];

        for (const markingServicePropertyId of createProductDto.markingServiceProperties) {
          const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
            where: {
              id: markingServicePropertyId,
            },
          });

          if (!markingServiceProperty)
            throw new NotFoundException(`Marking service property with id ${markingServicePropertyId} not found`);

          if (!markingServiceProperty.isActive)
            throw new BadRequestException(`Marking service property with id ${markingServicePropertyId} is currently inactive`);

          markingServiceProperties.push(markingServiceProperty);
        }

        newProduct.markingServiceProperties = markingServiceProperties;
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
        'refProduct',
        'refProduct.images',
        'markingServiceProperties',
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
        'refProduct',
        'refProduct.images',
        'markingServiceProperties',
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
        'packings',
        'refProduct',
        'refProduct.images',
        'markingServiceProperties',
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

    if (updateProductDto.markingServiceProperties) {
      const markingServiceProperties: MarkingServiceProperty[] = [];

      for (const markingServicePropertyId of updateProductDto.markingServiceProperties) {
        const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
          where: {
            id: markingServicePropertyId,
          },
        });

        if (!markingServiceProperty)
          throw new NotFoundException(`Marking service property with id ${markingServicePropertyId} not found`);

        if (!markingServiceProperty.isActive)
          throw new BadRequestException(`Marking service property with id ${markingServicePropertyId} is currently inactive`);

        markingServiceProperties.push(markingServiceProperty);
      }

      updatedProduct.markingServiceProperties = markingServiceProperties;
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

      if (updateProductDto.markingServiceProperties) {
        const markingServiceProperties: MarkingServiceProperty[] = [];

        for (const markingServicePropertyId of updateProductDto.markingServiceProperties) {
          const markingServiceProperty: MarkingServiceProperty = await this.markingServicePropertyRepository.findOne({
            where: {
              id: markingServicePropertyId,
            },
          });

          if (!markingServiceProperty)
            throw new NotFoundException(`Marking service property with id ${markingServicePropertyId} not found`);

          if (!markingServiceProperty.isActive)
            throw new BadRequestException(`Marking service property with id ${markingServicePropertyId} is currently inactive`);

          markingServiceProperties.push(markingServiceProperty);
        }

        updatedProduct.markingServiceProperties = markingServiceProperties;
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