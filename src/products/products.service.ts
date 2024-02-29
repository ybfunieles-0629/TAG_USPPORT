import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

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
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { RequireProductDto } from './dto/require-product.dto';
import { RefProductsService } from '../ref-products/ref-products.service';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';
import { DeliveryTime } from '../delivery-times/entities/delivery-time.entity';
import { Packing } from '../packings/entities/packing.entity';
import { Disccounts } from '../disccounts/entities/disccounts.entity';
import { Disccount } from '../disccount/entities/disccount.entity';
import { ListPrice } from '../list-prices/entities/list-price.entity';
import { SupplierPrice } from '../supplier-prices/entities/supplier-price.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { CategoryTag } from '../category-tag/entities/category-tag.entity';


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

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,

    @InjectRepository(Disccount)
    private readonly disccountRepository: Repository<Disccount>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,

    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

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

    @Inject('EMAIL_CONFIG') private emailSenderConfig,
  ) { }

  //* ---------- LOAD PROMOS PRODUCTS METHOD ---------- *//
  private async generateUniqueTagSku(): Promise<string> {
    const lastProducts: Product[] = await this.productRepository.find({
      order: {
        createdAt: 'DESC'
      },
    });

    const lastProduct: Product = lastProducts[0];

    let tagSku: string;

    if (lastProduct && lastProduct.tagSku.trim() !== '') {
      const lastSkuMatch = lastProduct.tagSku.match(/\d+/);
      let skuNumber: number;

      if (lastSkuMatch && lastSkuMatch.length > 0) {
        skuNumber = parseInt(lastSkuMatch[0], 10);
        skuNumber++;
      } else {
        skuNumber = 1001;
      }

      tagSku = `SKU-${skuNumber}`;
    } else {
      tagSku = 'SKU-1001';
    }

    let existingProduct = await this.productRepository.findOne({
      where: {
        tagSku: tagSku
      }
    });

    while (existingProduct) {
      let skuNumber: number = parseInt(tagSku.match(/\d+/)[0], 10);
      skuNumber++;
      tagSku = `SKU-${skuNumber}`;
      existingProduct = await this.productRepository.findOne({
        where: {
          tagSku: tagSku
        }
      });
    }

    return tagSku;
  };

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

    const refProductsInDb: RefProduct[] = await this.refProductRepository.find({
      relations: [
        'products',
      ],
    });

    const productsInDb: Product[] = await this.productRepository.find({
      relations: [
        'refProduct',
      ],
    });

    const refProductsToSave: RefProduct[] = [];
    const productsToSave: Product[] = [];

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
        relations: [
          'categoryTag',
        ],
      });

      if (!categorySupplier)
        throw new NotFoundException(`Category with id ${product.idCategoria} not found`);

      const newReference = {
        name: product.nombre,
        description: product.resumen,
        keywords: product.palabrasClaveSeo,
        markedDesignArea: product.descripcionProducto,
        images,
        tagCategory: categorySupplier.categoryTag.id || '',
        referenceCode: product.referencia,
        mainCategory: categorySupplier.id,
        supplier: user.supplier,
      };

      const referencePrice: number = product.precio1;

      const existingRefProduct = refProductsInDb.find(refProduct => refProduct.referenceCode === product.referencia);

      let savedRefProduct: RefProduct;
      if (existingRefProduct) {
        savedRefProduct = existingRefProduct;
      } else {
        const createdRefProduct: RefProduct = this.refProductRepository.create(newReference);
        savedRefProduct = await this.refProductRepository.save(createdRefProduct);
        refProductsToSave.push(savedRefProduct);
      }

      let tagSku: string = await this.generateUniqueTagSku();

      const { data: { data } } = await axios.get(`${this.apiUrl}/stock/${product.referencia}`);

      await Promise.all(data?.resultado?.map(async (product) => {
        const existingProductInDb = productsInDb.find(prod => prod.refProduct.referenceCode === product.referencia);

        if (existingProductInDb) {
          if (existingProductInDb.availableUnit !== product.totalDisponible ||
            existingProductInDb.referencePrice !== referencePrice) {
            existingProductInDb.availableUnit = product.totalDisponible;
            existingProductInDb.referencePrice = product.referencePrice;
            await this.productRepository.save(existingProductInDb);
            productsToSave.push(existingProductInDb);
          }
        } else {
          const color: Color = await this.colorRepository
            .createQueryBuilder('color')
            .where('LOWER(color.name) = :productColor', { productColor: product.color.toLowerCase() })
            .getOne();

          const colorsToAssign: Color[] = [];

          if (color) {
            colorsToAssign.push(color);
          }

          const newProduct = {
            tagSku,
            availableUnit: product.totalDisponible,
            supplierSku: tagSku,
            refProduct: savedRefProduct,
            referencePrice,
            apiCode: product.id,
            colors: colorsToAssign
          };

          const createdProduct: Product = this.productRepository.create(newProduct);
          await this.productRepository.save(createdProduct);
          productsToSave.push(createdProduct);
        }
      }));
    }

    const productCodes: string[] = productsToSave.map(product => product.apiCode);
    const productCodesString: string = productCodes.join(', ');

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
        to: 'yeison.descargas@gmail.com',
        subject: 'Productos nuevos y/o actualizados',
        text: `
          Productos nuevos y/o actualizados:
          ${productCodesString}
          `,
      });
    } catch (error) {
      console.log('Failed to send the email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

    return {
      refProductsToSave,
      productsToSave
    };
  }

  private async loadMarpicoProducts() {
    const apiUrl = 'https://marpicoprod.azurewebsites.net/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const config = {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    };

    const { data: { results } } = await axios.get(apiUrl, config);

    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const refProductsInDb: RefProduct[] = await this.refProductRepository.find({
      relations: [
        'products',
        'products.refProduct',
      ],
    });
    const productsInDb: Product[] = await this.productRepository.find({
      relations: [
        'refProduct',
        'refProduct.products',
      ],
    });

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

      const categorySuppliers: CategorySupplier[] = [];
      const categoryTags: CategoryTag[] = [];

      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          apiReferenceId: item.subcategoria_1.categoria.jerarquia,
        },
        relations: [
          'categoryTag'
        ],
      });

      const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          id: categorySupplier?.categoryTag?.id,
        },
      });

      if (categoryTag)
        categoryTags.push(categoryTag);

      categorySuppliers.push(categorySupplier);

      if (item.subcategoria_2 != null || item.subcategoria_2 != undefined) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            apiReferenceId: item.subcategoria_1.categoria.jerarquia,
          },
          relations: [
            'categoryTag'
          ],
        });

        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: categorySupplier?.categoryTag?.id,
          },
        });

        if (categoryTag)
          categoryTags.push(categoryTag);

        categorySuppliers.push(categorySupplier);
      };

      if (item.subcategoria_3 != null || item.subcategoria_2 != undefined) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            apiReferenceId: item.subcategoria_1.categoria.jerarquia,
          },
          relations: [
            'categoryTag'
          ],
        });

        const categoryTag: CategoryTag = await this.categoryTagRepository.findOne({
          where: {
            id: categorySupplier?.categoryTag?.id,
          },
        });

        if (categoryTag)
          categoryTags.push(categoryTag);

        categorySuppliers.push(categorySupplier);
      };

      if (!categorySupplier)
        throw new NotFoundException(`Category with id ${item.subcategoria_1.categoria.jerarquia} not found`);

      let newRefProduct = {
        name: item.descripcion_comercial,
        referenceCode: item.familia,
        shortDescription: item.descripcion_comercial,
        description: item.descripcion_larga,
        mainCategory: categorySupplier?.id || '',
        tagCategory: categorySupplier?.categoryTag?.id || '',
        keywords: keyword,
        large: +item.medidas_largo,
        width: +item.medidas_ancho,
        height: +item.medidas_alto,
        weight: +item.medidas_peso_neto,
        importedNational: 1,
        markedDesignArea: item.area_impresion || '',
        supplier: user.supplier,
        personalizableMarking: 0,
        images,
      }

      cleanedRefProducts.push(newRefProduct);

      for (const material of item.materiales) {
        const productImages: Image[] = [];

        for (const imagen of material.imagenes) {
          const image: Image = this.imageRepository.create({
            url: imagen.file,
          });

          await this.imageRepository.save(image);

          productImages.push(image);
        }

        const newProduct = {
          apiCode: item.familia,
          images: productImages,
          material,
        };

        productsToSave.push(newProduct);
      }
    }

    for (const refProduct of cleanedRefProducts) {
      const refProductExists = refProductsInDb.find(refProductInDb => refProductInDb?.referenceCode == refProduct?.referenceCode);

      // if (refProductExists) {
      //   // Verificar si el producto existe y necesita actualización
      //   const existingProductInDb = productsInDb.find(product => product?.refProduct?.referenceCode === refProduct?.referenceCode && product?.apiCode);

      //   if (existingProductInDb) {
      //     // Comparar los campos que pueden haber cambiado y actualizarlos si es necesario
      //     if (existingProductInDb.availableUnit !== refProduct?.availableUnit ||
      //       existingProductInDb.referencePrice !== refProduct?.referencePrice ||
      //       existingProductInDb.promoDisccount !== refProduct?.promoDisccount) {
      //       existingProductInDb.availableUnit = refProduct?.availableUnit;
      //       existingProductInDb.referencePrice = refProduct?.referencePrice;
      //       existingProductInDb.promoDisccount = refProduct?.promoDisccount;
      //       await this.productRepository.save(existingProductInDb);
      //       productsToSave.push(existingProductInDb);
      //     }
      //   }
      // } else {
        // Si el producto no existe, guardarlo como nuevo
        const savedRefProduct: RefProduct = await this.refProductRepository.save(refProduct);
        refProductsToSave.push(savedRefProduct);
      // }
    }

    if (refProductsToSave.length === 0 && productsToSave.length === 0)
      throw new BadRequestException(`There are no new or updated products to save`);

    const productCodes: string[] = productsToSave.map(product => product.apiCode);
    const productCodesString: string = productCodes.join(', ');

    try {
      // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: 'yeison.descargas@gmail.com',
        subject: 'Productos nuevos y/o actualizados',
        text: `
          Productos nuevos y/o actualizados:
          ${productCodesString}
          `,
      });
    } catch (error) {
      console.log('Failed to send the email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }

    return {
      refProductsToSave,
      productsToSave
    };
  }

  //* ---------- LOAD ALL PRODUCTS FROM EXT APIS ---------- *//
  async loadProducts(supplier: string) {
    const supplierName: string = supplier || '';

    if (supplierName.toLowerCase().trim() == 'marpico') {
      await this.loadMarpicoProducts();
    } else if (supplierName.toLowerCase().trim() == 'promos') {
      await this.loadPromosProducts();
    } else {
      await this.loadMarpicoProducts();
      await this.loadPromosProducts();
    };
  }

  async create(createProductDto: CreateProductDto, user: User) {
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

    const { height, large, width } = createProductDto;

    const volume: number = (height * large * width);

    const newProduct = plainToClass(Product, createProductDto);

    newProduct.volume = volume;

    newProduct.createdBy = user.id;

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

    if (createProductDto.disccounts) {
      const disccounts: Disccount[] = [];

      for (const disccount of createProductDto.disccounts) {
        const disccountInDb: Disccount = await this.disccountRepository.findOne({
          where: {
            id: disccount,
          },
        });

        if (!disccountInDb)
          throw new NotFoundException(`disccount with id ${disccount} not found`);

        disccounts.push(disccountInDb);
      }

      newProduct.disccounts = disccounts;
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

  async createMultiple(createMultipleProducts: CreateProductDto[], user: User) {
    const createdProducts = [];

    const lastProducts = await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });

    for (const createProductDto of createMultipleProducts) {
      const { height, large, width } = createProductDto;

      const volume: number = (height * large * width);

      if (lastProducts[0] && lastProducts[0].tagSku.trim() !== ''.trim()) {
        let skuNumber: number = parseInt(lastProducts[0].tagSku.match(/\d+/)[0], 10);

        skuNumber++;

        const newTagSku = `SKU-${skuNumber}`;

        createProductDto.tagSku = newTagSku;
      } else {
        createProductDto.tagSku = 'SKU-1001';
      }

      const newProduct = plainToClass(Product, createProductDto);

      newProduct.createdBy = user.id;

      newProduct.volume = volume;

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

      if (createProductDto.disccounts) {
        const disccounts: Disccount[] = [];

        for (const disccount of createProductDto.disccounts) {
          const disccountInDb: Disccount = await this.disccountRepository.findOne({
            where: {
              id: disccount,
            },
          });

          if (!disccountInDb)
            throw new NotFoundException(`disccount with id ${disccount} not found`);

          disccounts.push(disccountInDb);
        }

        newProduct.disccounts = disccounts;
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

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.productRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: Product[] = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'colors',
        'variantReferences',
        'packings',
        'refProduct',
        'refProduct.images',
        'markingServiceProperties',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
      ],
    });

    return {
      count,
      results
    };
  }

  async calculations(product: Product, quantity: number) {
    let staticQuantities: number[] = [];
    staticQuantities.push(quantity);

    const systemConfigs: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigs[0];

    const localTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    const burnPriceTable = [];

    const initialValue: number = product.referencePrice;
    let changingValue: number = initialValue;

    for (let i = 0; i < staticQuantities.length; i++) {
      let prices = {
        quantity: staticQuantities[i],
        value: changingValue,
        totalValue: 0,
        transportPrice: 0,
      };

      burnPriceTable.push(prices);

      const percentageDiscount: number = 0.01;

      let value: number = changingValue * (1 - percentageDiscount);

      value = Math.round(value);

      changingValue = value;

      //* SI EL PRODUCTO NO TIENE UN PRECIO NETO
      if (product.hasNetPrice == 0) {
        //* SI EL PRODUCTO TIENE UN PRECIO PROVEEDOR ASOCIADO
        if (product.supplierPrices.length > 0) {
          const supplierPrice: SupplierPrice = product.supplierPrices[0];

          //* RECORRO LA LISTA DE PRECIOS DEL PRECIO DEL PROVEEDOR
          supplierPrice.listPrices.forEach((listPrice: ListPrice) => {
            if (listPrice.minimun >= i && listPrice.nextMinValue == 1 && listPrice.maximum <= i || listPrice.minimun >= i && listPrice.nextMinValue == 0) {
              //* SI APLICA PARA TABLA DE PRECIOS DE PROVEEDOR
              value += listPrice.price;
              return;
            };
          });
        };

        //* SI LO ENCUENTRA LO AÑADE, SINO LE PONE UN 0 Y NO AÑADE NADA
        const entryDiscount: number = product.entryDiscount || 0;
        const entryDiscountValue: number = (entryDiscount / 100) * value || 0;
        value -= entryDiscountValue;

        //* BUSCO DESCUENTO PROMO
        const promoDiscount: number = product.promoDisccount || 0;
        const promoDiscountPercentage: number = (promoDiscount / 100) * value || 0;
        value -= promoDiscountPercentage;

        // //* APLICAR DESCUENTO POR MONTO
        if (product?.refProduct?.supplier?.disccounts?.length > 0) {
          product?.refProduct?.supplier?.disccounts?.forEach((discountItem: Disccount) => {
            //* SI EL DESCUENTO ES DE TIPO MONTO
            if (discountItem.disccountType.toLowerCase() == 'descuento de monto') {
              //* SI EL DESCUENTO TIENE DESCUENTO DE ENTRADA
              if (discountItem.entryDisccount != undefined || discountItem.entryDisccount != null || discountItem.entryDisccount > 0) {
                const discount: number = (discountItem.entryDisccount / 100) * value;
                value -= discount;

                return;
              };

              discountItem?.disccounts?.forEach((listDiscount: Disccounts) => {
                if (listDiscount.minQuantity >= i && listDiscount.nextMinValue == 1 && listDiscount.maxQuantity <= i || listDiscount.minQuantity >= i && listDiscount.nextMinValue == 0) {
                  const discount: number = (listDiscount.disccountValue / 100) * value;
                  value -= discount;

                  return;
                };
              });
            };
          });
        };
      };

      // //* APLICAR IVA
      if (product.iva > 0 || product.iva != undefined) {
        const iva: number = (product.iva / 100) * value;

        value += iva;
      };

      // //* VERIFICAR SI ES IMPORTADO NACIONAL
      if (product.importedNational.toLowerCase() == 'importado') {
        const importationFee: number = (systemConfig.importationFee / 100) * value;

        value += importationFee;
      };

      // //* VERIFICAR SI TIENE FEE DE IMPREVISTOS
      if (product.unforeseenFee > 0) {
        const unforeseenFee: number = (product.unforeseenFee / 100) * value;

        value += unforeseenFee;
      };

      const unforeseenFee: number = systemConfig.unforeseenFee;
      const unforeseenFeePercentage: number = (unforeseenFee / 100) * value;
      value += unforeseenFeePercentage;

      // //TODO: Validar calculos de ganacias por periodos y politicas de tienpos de entrega
      // //TODO: Después del margen del periodo validar del comercial
      // //* IDENTIFICAR PORCENTAJE DE ANTICIPIO DE PROVEEDOR
      const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
      const advancePercentageValue: number = (advancePercentage / 100) * value;
      value += advancePercentageValue;

      // //* CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
      const packing: Packing = product.packings[0] || undefined;
      const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

      let totalPackingVolume: number = 0;
      let packingWeight: number = 0;

      if (packingUnities > 0 && packingUnities != undefined) {
        let boxesQuantity: number = (i / packingUnities);

        boxesQuantity = Math.round(boxesQuantity) + 1;

        //   //* CALCULAR EL VOLUMEN DEL PAQUETE
        const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
        const totalVolume: number = (packingVolume * boxesQuantity) || 0;
        totalPackingVolume = totalVolume || 0;

        //   //* CALCULAR EL PESO DEL PAQUETE
        packingWeight = (packing?.smallPackingWeight * boxesQuantity) || 0;
      }

      // //* IDENTIFICAR TIEMPO DE ENTREGA ACORDE AL PRODUCTO
      const availableUnits: number = product?.availableUnit || 0;
      let deliveryTimeToSave: number = 0;

      if (i > availableUnits) {
        product.refProduct.deliveryTimes.forEach((deliveryTime: DeliveryTime) => {
          if (deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 1 && deliveryTime?.maximum <= i || deliveryTime?.minimum >= i && deliveryTime?.minimumAdvanceValue == 0) {
            deliveryTimeToSave = deliveryTime?.timeInDays || 0;
          }
        });
      } else if (availableUnits > 0 && i < availableUnits) {
        deliveryTimeToSave = product?.refProduct?.productInventoryLeadTime || 0;
      };

      //* CALCULAR COSTOS FINANCIEROS DEL PERIODO DE PRODUCCIÓN
      const supplierFinancingPercentage: number = systemConfig.supplierFinancingPercentage || 0;
      const financingCost: number = ((value - advancePercentage) * supplierFinancingPercentage) * deliveryTimeToSave;
      value += financingCost;

      //* CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
      const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
        ? localTransportPrices.sort((a, b) => {
          const diffA = Math.abs(a.volume - totalPackingVolume);
          const diffB = Math.abs(b.volume - totalPackingVolume);
          return diffA - diffB;
        })[0]
        : undefined;

      const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

      value += transportPrice;

      prices.transportPrice = transportPrice;

      //* CALCULAR EL IMPUESTO 4 X 1000
      value += (value * 1.04);

      //* CALCULAR EL COSTO DE LA OPERACIÓN (YA HECHO)

      //* ADICIONAR EL % DE MARGEN DE GANANCIA SOBRE EL PROVEEDOR
      const profitMargin: number = product?.refProduct?.supplier?.profitMargin || 0;
      const profitMarginPercentage: number = (profitMargin / 100) * value;
      value += profitMarginPercentage;

      //* ADICIONAR EL % DE MARGEN DE GANANCIA DEL PRODUCTO
      const mainCategory: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          id: product?.refProduct?.mainCategory,
        },
      });

      if (mainCategory) {
        value += (parseInt(mainCategory?.categoryTag?.categoryMargin)) || 0;
      };

      //* PRECIO TOTAL ANTES DEL IVA (YA HECHO)
      value += product.iva;

      //* CALCULAR EL PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
      value = Math.round(value);

      prices.totalValue = value;
    }

    return { ...product, burnPriceTable };
  };

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
        'refProduct.packings',
        'markingServiceProperties',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
      ],
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    return {
      product
    };
  }

  async findOneWithCalculations(id: string, quantity: number) {
    const finalQuantity: number = quantity ?? 1;

    const product = await this.productRepository.findOne({
      where: {
        id
      },
      relations: [
        'images',
        'disccounts',
        'refProduct',
        'refProduct.deliveryTimes',
        'refProduct.supplier',
        'refProduct.supplier.disccounts',
        'colors',
        'variantReferences',
        'packings',
        'supplierPrices',
        'supplierPrices.product',
        'supplierPrices.listPrices',
        'markingServiceProperties',
        'markingServiceProperties.images',
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
      ],
    });

    const result = await this.calculations(product, finalQuantity);

    return {
      result
    };
  };

  async filterProductsBySupplier(id: string) {
    const products: Product[] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variantReferences', 'productVariantReferences')
      .leftJoinAndSelect('product.colors', 'productColors')
      .leftJoin('product.refProduct', 'refProduct')
      .where('refProduct.supplierId = :supplierId', { supplierId: id })
      .getMany();

    return {
      products
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
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
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
      ],
    });

    const updatedProduct = plainToClass(Product, updateProductDto);

    updatedProduct.updatedBy = user.id;

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

    if (updateProductDto.disccounts) {
      const disccounts: Disccount[] = [];

      for (const disccount of updateProductDto.disccounts) {
        const disccountInDb: Disccount = await this.disccountRepository.findOne({
          where: {
            id: disccount,
          },
        });

        if (!disccountInDb)
          throw new NotFoundException(`disccount with id ${disccount} not found`);

        disccounts.push(disccountInDb);
      }

      updatedProduct.disccounts = disccounts;
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

  async updateMultiple(updateMultipleProducts: UpdateProductDto[], user: User) {
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

      updatedProduct.updatedBy = user.id;

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

      if (updateProductDto.disccounts) {
        const disccounts: Disccount[] = [];

        for (const disccount of updateProductDto.disccounts) {
          const disccountInDb: Disccount = await this.disccountRepository.findOne({
            where: {
              id: disccount,
            },
          });

          if (!disccountInDb)
            throw new NotFoundException(`disccount with id ${disccount} not found`);

          disccounts.push(disccountInDb);
        }

        updatedProduct.disccounts = disccounts;
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

  async requireProduct(requireProductDto: RequireProductDto, file: Express.Multer.File) {
    const {
      name,
      email,
      phone,
      productName,
      quantity,
      productDescription
    } = requireProductDto;

    let image: string;

    if (file != undefined || file != null) {
      const uniqueFilename = `request-${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      image = imageUrl;
    };

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const attachments = [];
      if (image) {
        attachments.push({
          filename: 'image.png',
          path: image,
          cid: image
        });
      }

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: ['puertodaniela586@gmail.com', 'locarr785@gmail.com', 'yeison.descargas@gmail.com'],
        subject: 'Solicitud de producto',
        html: `
          <p>Nombre: ${name}</p>
          <p>Correo electrónico: ${email}</p>
          <p>Teléfono: ${phone}</p>
          <p>Nombre del producto: ${productName}</p>
          <p>Cantidad: ${quantity}</p>
          <p>Descripción del producto: ${productDescription}</p>
          ${image ? '<img src="cid:unique@nodemailer.com" />' : ''}
        `,
        attachments: attachments
      });
    } catch (error) {
      console.log('Failed to send the product request email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }
  };

  async desactivate(id: string) {
    const { product } = await this.findOne(id);

    product.isActive = !product.isActive;

    await this.productRepository.save(product);

    return {
      product
    };
  }

  async changeIsAllowedStatus(id: string) {
    const product: Product = await this.productRepository.findOneBy({ id });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    product.isAllowed == 0 ? product.isAllowed = 1 : product.isAllowed = 0;

    await this.productRepository.save(product);

    return {
      product
    };
  }

  async changeMultipleIsAllowedStatus(ids: string[]) {
    const allowedProducts: Product[] = [];

    for (const id of ids) {
      const product: Product = await this.productRepository.findOneBy({ id });

      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);

      product.isAllowed == 0 ? product.isAllowed = 1 : product.isAllowed = 0;

      const productAllowed = await this.productRepository.save(product);

      allowedProducts.push(productAllowed);
    };

    return {
      allowedProducts
    };
  }

  async remove(id: string) {
    const { product } = await this.findOne(id);

    await this.productRepository.remove(product);

    return {
      product
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
    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}


// Yeison