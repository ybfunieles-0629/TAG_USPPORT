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

    const { height, large, width } = createProductDto;

    const volume: number = (height * large * width);

    const newProduct = plainToClass(Product, createProductDto);

    newProduct.volume = volume;

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

  async createMultiple(createMultipleProducts: CreateProductDto[]) {
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
        'markingServiceProperties.externalSubTechnique',
        'markingServiceProperties.externalSubTechnique.marking',
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
        to: ['puertodaniela586@gmail.com', 'locarr785@gmail.com', 'yeison.descargas@gmail.com'],
        subject: 'Solicitud de producto',
        text: `
        Nombre: ${name},
        Correo electrónico: ${email},
        Teléfono: ${phone},
        Nombre del product. ${productName},
        Cantidad: ${quantity},
        Descripción del producto: ${productDescription},
        Imagen: <img src="${image}" />
        `,
      });
    } catch (error) {
      console.log('Failed to send the password recovery email', error);
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