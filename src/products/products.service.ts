import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { delay } from 'bluebird';

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
import { Company } from 'src/companies/entities/company.entity';
import { IsHexadecimal } from 'class-validator';
import { Suscription } from 'src/suscriptions/entities/suscription.entity';


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

     @InjectRepository(Suscription)
    private readonly suscriptionRepository: Repository<Suscription>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,


    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,


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

  // Filtrar las categorias y cambiar las acentuaciones
  normalizeCategoryName(categoryName: string | null | undefined): string {

    if (!categoryName) {
      return ''; // Devuelve una cadena vacía si el nombre de la categoría es nulo o indefinido
    }

    return categoryName
      .replace(/&aacute;/g, 'á')
      .replace(/&eacute;/g, 'é')
      .replace(/&iacute;/g, 'í')
      .replace(/&oacute;/g, 'ó')
      .replace(/&uacute;/g, 'ú')
      // Otros caracteres especiales pueden ser tratados de manera similar
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }


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
        // const existingProductInDb = productsInDb.find(prod => prod?.refProduct?.referenceCode === product.referencia);

        // if (existingProductInDb) {
        // if (existingProductInDb.availableUnit !== product.totalDisponible ||
        //   existingProductInDb.referencePrice !== referencePrice) {
        //   existingProductInDb.availableUnit = product.totalDisponible;
        //   existingProductInDb.referencePrice = product.referencePrice;
        //   await this.productRepository.save(existingProductInDb);
        //   productsToSave.push(existingProductInDb);
        // }
        // } else {
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
        // }
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



  private async loadMarpicoProductss() {
    const apiUrl = 'https://apipromocionales.marpico.co/api/inventarios/materialesAPI';
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
          url: imagen.imagen,
        };

        const createdImage: Image = this.imageRepository.create(newImage);
        const savedImage: Image = await this.imageRepository.save(createdImage);

        images.push(savedImage);
      }

      const categorySuppliers: CategorySupplier[] = [];
      const categoryTags: CategoryTag[] = [];

      const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
        where: {
          apiReferenceId: item.subcategoria_1.jerarquia,
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
            apiReferenceId: item.subcategoria_1.jerarquia,
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
            apiReferenceId: item.subcategoria_1.jerarquia,
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
        throw new NotFoundException(`Category with id ${item.subcategoria_1.jerarquia} not found`);

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
        personalizableMarking: item.tecnica_marca_codigo || 0,
        images,
      }

      cleanedRefProducts.push(newRefProduct);

      let packageReferences = {
        unities: +item.empaque_unds_caja,
        large: +item.empaque_largo,
        width: +item.empaque_ancho,
        height: +item.empaque_alto,
        smallPackingWeight: +item.empaque_peso_bruto,
        product: "",
        refProduct: ""
      }


      for (const material of item.materiales) {
        const productImages: Image[] = [];

        for (const imagen of material.imagenes) {
          const image: Image = this.imageRepository.create({
            url: imagen.file,
          });

          await this.imageRepository.save(image);

          productImages.push(image);
        }

        // Calcular la suma de las cantidades en trackings_importacion
        let totalCantidad = 0;
        for (const tracking of material.trackings_importacion) {
          totalCantidad += tracking.cantidad;
        }


        let tagSku: string = await this.generateUniqueTagSku();
        const availableUnit =
          item.inventario && item.inventario.length > 0
            ? item.inventario[0].cantidad || 0
            : 0;

        // const colorProducts: CategorySupplier = await this.colorRepository.findOne({
        //   where: {
        //     name: Like(`%${material.color_nombre}%`)
        //   }
        // });


        const newProduct = {
          tagSku,
          availableUnit,
          transitUnit: totalCantidad || 0,
          productArrivalDate:
            item.trackings_importacion && item.trackings_importacion.length > 0
              ? item.trackings_importacion[0].fecha || 0
              : 0,
          referencePrice: item.precio,
          promoDisccount: item.descuento || 0,
          familia: item.familia,
          supplierSKu: material.codigo,
          apiCode: material.codigo,
          large: +item.medidas_largo,
          width: +item.medidas_ancho,
          height: +item.medidas_alto,
          weight: +item.medidas_peso_neto,
          material,
        };

        productsToSave.push(newProduct);
      };
    }

    const refProductCodes: string[] = [];
    const refProductCodesString: string = refProductCodes.join(', ');
    const updatedProductsCode: string[] = [];

    for (const refProduct of cleanedRefProducts) {
      const refProductExists = refProductsInDb.find(refProductInDb => refProductInDb?.referenceCode == refProduct?.referenceCode);

      if (refProductExists) {
        const fieldsToUpdate = ['name', 'referenceCode', 'shortDescription', 'description', 'mainCategory', 'tagCategory', 'keywords', 'large', 'width', 'height', 'weight', 'importedNational', 'markedDesignArea', 'supplier', 'personalizableMarking'];

        for (const field of fieldsToUpdate) {
          if (refProduct[field] !== undefined && refProductExists[field] !== refProduct[field]) {
            refProductExists[field] = refProduct[field];
            refProductCodes.push(refProductExists.referenceCode);
          }
        }

        if (refProductCodes.length > 0) {
          await this.refProductRepository.save(refProductExists);

        } else {
          const savedRefProduct: RefProduct = await this.refProductRepository.save(refProduct);
          refProductsToSave.push(savedRefProduct);
        }
      }

      //* ---------- LOAD PRODUCTS ----------*//
      for (const product of productsToSave) {
        const refProduct = await this.refProductRepository.findOne({
          where: {
            referenceCode: product.familia,
          },
        });

        if (!refProduct)
          throw new NotFoundException(`Ref product for product with familia ${product.familia} not found`);

        const productColor: string = product?.color?.toLowerCase() || '';

        const color: Color = await this.colorRepository
          .createQueryBuilder('color')
          .where('LOWER(color.name) =:productColor', { productColor })
          .getOne();

        const colors: Color[] = [];

        if (color) {
          color.refProductId = refProduct?.id;

          const savedColor: Color = await this.colorRepository.save(color);
        };

        let tagSku: string = await this.generateUniqueTagSku();



        const newProduct = {
          tagSku,
          supplierSku: product?.supplierSku,
          apiCode: product?.apiCode,
          variantReferences: [],
          large: +product?.large || 0,
          width: +product?.width || 0,
          height: +product?.height || 0,
          weight: +product?.weight || 0,
          colors,
          referencePrice: product.referencePrice,
          // promoDisccount: parseFloat(product.material.descuento.replace('-', '')),
          promoDisccount: product?.promoDisccount,
          availableUnit: product?.inventario,
          refProduct,
        };

        const productExists = productsInDb.find((product) => product.apiCode == product.apiCode);

        if (productExists) {
          const fieldsToUpdate = ['name', 'referenceCode', 'shortDescription', 'description', 'mainCategory', 'tagCategory', 'keywords', 'large', 'width', 'height', 'weight', 'importedNational', 'markedDesignArea', 'supplier', 'personalizableMarking'];

          const refProductCodes: string[] = [];
          const refProductCodesString: string = refProductCodes.join(', ');

          for (const field of fieldsToUpdate) {
            if (refProduct[field] !== undefined && productExists[field] !== refProduct[field]) {
              productExists[field] = refProduct[field];
              updatedProductsCode.push(productExists.apiCode);
            }
          }

          if (refProductCodes.length > 0) {
            await this.productRepository.save(productExists);
          } else {
            const createdProduct: Product = this.productRepository.create(newProduct);
            const savedProduct: Product = await this.productRepository.save(createdProduct);
          }
        }
      };
    }

    if (refProductsToSave.length === 0 && productsToSave.length === 0)
      throw new BadRequestException(`There are no new or updated products to save`);

    const productCodes: string[] = productsToSave.map(product => product.apiCode);
    const productCodesString: string = productCodes.join(', ');



    // try {
    //   // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
    //   const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: process.env.EMAIL_USER,
    //       pass: process.env.EMAIL_PASSWORD,
    //     },
    //   });

    //   await transporter.sendMail({
    //     from: this.emailSenderConfig.transport.from,
    //     to: 'yeison.descargas@gmail.com',
    //     subject: 'Productos y referencias nuevos y/o actualizados',
    //     text: `
    //       Productos nuevos y/o actualizados:
    //       ${productCodesString}

    //       Referencias nuevas y/o actualizadas:
    //       ${refProductCodesString}
    //       `,
    //   });
    // } catch (error) {
    //   console.log('Failed to send the email', error);
    //   throw new InternalServerErrorException(`Internal server error`);
    // }

    return {
      refProductsToSave,
      productsToSave
    };
  }





  // INTEGRACIONES MARPICO
  // =========================================================
  private async loadMarpicoRefProducts() {

    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];


    // URL API
    const apiUrl = 'https://apipromocionales.marpico.co/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const config = {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    };

    // CONSULTAMOS LA IFORMACIÓN DE LA EMPRESA Y ACCEDEMOS A SU PROVEEDOR
    const nameCompany = 'Marpico SAS';
    const company = await this.companyRepository.findOne({
      where: { name: nameCompany },
      relations: ['users', 'users.supplier'],
    });

    if (!company) {
      throw new NotFoundException(`Company with name ${nameCompany} not found`);
    }

    // ID DEL PROVEEDOR DE RODUCTO
    const supplierId = company?.users[0]?.supplier?.id

    console.log(company?.users[0]?.supplier)

    try {
      // const response = await axios.post(apiUrl, bodyData, config);
      const { data: { results } } = await axios.get(apiUrl, config);

      if (results) {

        // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DEL REFERENCIAS
        const RefProductsNoCompleteCategory: any[] = [];
        let categorySupplierSearch: any;

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
              url: imagen,
            };

            const createdImage: Image = this.imageRepository.create(newImage);
            const savedImage: Image = await this.imageRepository.save(createdImage);

            images.push(savedImage);
          }

          // FILTRAMOS PARA QUE LAS CATEGORIAS QUE VIENEN MAL ACENTUADAS, SE ARREGLEN
          const categoryName = item?.subcategoria_1?.nombre || ''; // Valor por defecto si es undefined
          const normalizedCategoryName = this.normalizeCategoryName(categoryName);

          // GUARDAMOS LAS CATEGRIAS NUEVAS
          // Buscamos la categoría en el repositorio
          let categorySupplierSearch = await this.categorySupplierRepository.findOne({
            where: { origin: 'Marpico', name: normalizedCategoryName },
            relations: ['categoryTag'],
          });

          // Si no encontramos la categoría, la creamos
          if (!categorySupplierSearch) {
            let offspringType = 'Principal';
            let mainCategory = '';

            // Verificamos si hay jerarquía en subcategorias
            if (item.subcategoria_1?.jerarquia) {
              offspringType = 'Padre';
              mainCategory = item.subcategoria_1.jerarquia;
            } else if (item.subcategoria_2?.jerarquia) {
              offspringType = 'Padre';
              mainCategory = item.subcategoria_2.jerarquia;
            } else if (item.subcategoria_3?.jerarquia) {
              offspringType = 'Padre';
              mainCategory = item.subcategoria_3.jerarquia;
            }

            // Creamos la nueva categoría
            categorySupplierSearch = this.categorySupplierRepository.create({
              offspringType: offspringType,
              origin: 'Marpico',
              name: normalizedCategoryName,
              description: normalizedCategoryName,
              mainCategory: mainCategory ? mainCategory : undefined, // solo agregar si existe
              supplier: company.users[0].supplier, // Relacionamos el proveedor
            });

            // Guardamos la nueva categoría en la base de datos
            categorySupplierSearch = await this.categorySupplierRepository.save(categorySupplierSearch);
          }



          const categorySuppliers: CategorySupplier[] = [];
          const categoryTags: CategoryTag[] = [];
          let categorySupplier: CategorySupplier = null;
          let categoryTag: CategoryTag = null;


          try {
            categorySupplier = await this.categorySupplierRepository.findOne({
              where: {
                name: normalizedCategoryName,
                origin: 'Marpico',
              },
              relations: ['categoryTag'],
            });

          } catch (error) {
            console.error('Error al buscar la categoría:', error);
          }

          if (categorySupplier) {
            try {
              categoryTag = await this.categoryTagRepository.findOne({
                where: {
                  id: categorySupplier.categoryTag?.id,
                },
              });
            } catch (error) {
              console.error('Error al buscar la etiqueta de categoría:', error);
            }

            if (categoryTag) {
              categoryTags.push(categoryTag);
            }

            categorySuppliers.push(categorySupplier);
          } else {
            RefProductsNoCompleteCategory.push(item.skuPadre)
            console.warn(`Categoría con nombre ${item.categorias} no encontrada.`);
            continue;
          }

          if (!categorySupplier)
            throw new NotFoundException(`Category not found`);


          // Inicializar el arreglo de colores sin refProductId
          const colors: Color[] = [];

          for (const material of item.materiales) {
            if (material.color_nombre) {
              // Buscar si el color ya existe en la base de datos
              let existingColor = await this.colorRepository.findOne({
                where: { name: material.color_nombre },
              });

              if (existingColor) {
                colors.push(existingColor);
              } else {
                // Si el color no existe, crearlo
                const newColor = this.colorRepository.create({
                  name: material.color_nombre,
                });

                const savedColor = await this.colorRepository.save(newColor);
                // Agregar el color creado a la lista de colores
                colors.push(savedColor);
              }
            }
          }


          let newRefProduct = {
            name: item.descripcion_comercial,
            referenceCode: item.familia,
            shortDescription: item.descripcion_comercial,
            description: item.descripcion_larga,
            mainCategory: categorySupplier?.id || '',
            tagCategory: categorySupplier?.categoryTag?.id || '',
            keywords: keyword,
            large: parseFloat(item.medidas_largo) || 0, // Valores por defecto
            width: parseFloat(item.medidas_ancho) || 0,
            height: parseFloat(item.medidas_alto) || 0,
            weight: parseFloat(item.medidas_peso_neto) || 0,
            importedNational: 1,
            markedDesignArea: item.area_impresion || '',
            supplier: company?.users[0]?.supplier,
            personalizableMarking: item.tecnica_marca_codigo || 0,
            images,
            colors,
          }

          cleanedRefProducts.push(newRefProduct);
          console.log(newRefProduct)
        }


        //   console.log(cleanedRefProducts)

        // INICIAMOS A GUARDAR LOS DATOS
        const refProductCodes: string[] = [];
        const RefProductsExisting: any[] = [];
        const RefProductsExistingUpdate: any[] = [];

        // GUARDAMOS LAS REFERENCIAS INICIALMENTE
        for (const refProduct of cleanedRefProducts) {
          const refProductExists = await this.refProductRepository.findOne({
            where: { referenceCode: refProduct.referenceCode },
          });



          for (const color of refProduct.colors) {
            const existingColorRelation = await this.colorRepository.findOne({
              where: { id: color.id, refProductId: refProductExists.id },
            });

            if (!existingColorRelation) {
              color.refProductId = refProductExists.id;
              await this.colorRepository.save(color);
            } else {
              continue;
            }
          }

          if (refProductExists) {
            const updatedRefProductData = {};
            for (const key in refProduct) {
              if (refProduct[key] !== '' && refProduct[key] !== null && refProduct[key] !== undefined) {
                updatedRefProductData[key] = refProduct[key];
              }
            }

            const updatedRefProduct = {
              ...refProductExists,
              ...updatedRefProductData,
            };

            const refProductUpdate = await this.refProductRepository.save(updatedRefProduct);


          } else {
            // Guardar el nuevo producto de referencia
            const savedRefProduct: RefProduct = await this.refProductRepository.save(refProduct);
            refProductsToSave.push(savedRefProduct);
            console.log(savedRefProduct);

            // Verificar y guardar relación refProduct-color
            for (const color of savedRefProduct.colors) {
              const existingColorRelation = await this.colorRepository.findOne({
                where: { id: color.id, refProductId: savedRefProduct.id },
              });

              if (!existingColorRelation) {
                color.refProductId = savedRefProduct.id;
                await this.colorRepository.save(color);
              }
            }
          }
        }

        // this.loadMarpicoProducts();

        return {
          response: refProductsToSave, RefProductsExistingUpdate
        };
      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      throw new Error('Error al cargar los productos');
    }
  }

  private async loadMarpicoProducts() {

    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // CONSULTA DE CANTIDAD
    const bodyDataStrock = {
      "user": "COL0238",
      "password": "h1xSgEICLQB2nqE19y2k"
    };


    // URL API STOCK PRODUCTOS
    const apiUrlStock = 'https://promocionalesenlinea.net/api/all-stocks';
    const responseStock = await axios.post(apiUrlStock, bodyDataStrock, config);

    const { success, Stocks } = responseStock.data;



    // URL API TODOS LOS PRODUCTOS
    const apiUrl = 'https://promocionalesenlinea.net/api/all-products';

    const bodyData = {
      user: 'COL0238',
      password: 'h1xSgEICLQB2nqE19y2k',
    };




    try {
      const response = await axios.post(apiUrl, bodyData, config);

      const { success, response: responseData } = response.data;
      if (success) {
        const cantidadExistente = responseData.length;

        console.log(responseData)
        // CONSULTAMOS LA IFORMACIÓN DE LA EMPRESA Y ACCEDEMOS A SU PROVEEDOR
        const nameCompany = 'Promo Opciones';
        const company = await this.companyRepository.findOne({
          where: { name: nameCompany },
          relations: ['users', 'users.supplier'],
        });

        if (!company) {
          throw new NotFoundException(`Company with name ${nameCompany} not found`);
        }

        console.log(company)


        // ID DEL PROVEEDOR DE RODUCTO
        const supplierId = company?.users[0]?.supplier?.id

        // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DE LOS PRODUCTOS
        const RefProductsNoCompleteCategory: any[] = [];
        let foundProduct = false;  // Variable de control quitar esto

        for (const item of responseData) {
          let keyword = item.nombrePadre;
          console.log(item)


          for (const material of item.hijos) {

            const productImages: Image[] = [];
            for (const imagen of material.imagenesHijo) {
              const newImage = {
                url: imagen,
              };
              const createdImage: Image = this.imageRepository.create(newImage);
              const savedImage: Image = await this.imageRepository.save(createdImage);
              productImages.push(savedImage);
            }

            let cantidadProducto = 0;

            for (const stockPro of Stocks) {
              cantidadProducto = stockPro.Stock || 0;
            }

            for (const imagen of material.imagenesHijo) {
              const image: Image = this.imageRepository.create({
                url: imagen,
              });

              await this.imageRepository.save(image);
              productImages.push(image);
            }

            let tagSku: string = await this.generateUniqueTagSku();
            const newProduct = {
              tagSku,
              availableUnit: cantidadProducto || 0,
              referencePrice: 0,
              promoDisccount: 0,
              familia: item.skuPadre,
              supplierSKu: material.skuHijo,
              apiCode: material.skuHijo,
              large: 0,
              width: 0,
              height: 0,
              weight: 0,
              material,
              medidas: item.medidas,
              color: material.color,
              images: productImages
            };

            productsToSave.push(newProduct);
            console.log(newProduct)
          };
        }


        // INICIAMOS A GUARDAR LOS DATOS
        const refProductCodes: string[] = [];
        const refProductCodesString: string = refProductCodes.join(', ');
        const updatedProductsCode: string[] = [];
        const RefProductsExisting: any[] = [];

        const productsInDb = await this.productRepository.find();


        //GUARDAMOS LOS PRODUCTOS RELACIONADAS A LA REFERENCIA
        for (const product of productsToSave) {
          const refProduct = await this.refProductRepository.findOne({
            where: {
              referenceCode: product.familia,
            },
          });

          if (!refProduct)
            throw new NotFoundException(`Ref product for product with familia ${product.familia} not found`);

          const productColor: string = product?.color?.toLowerCase() || '';


          let colorProduct: Color;
          const colors: Color[] = [];

          try {
            colorProduct = await this.colorRepository.findOne({
              where: {
                name: product.color,
              }
            });
          } catch (error) {
            console.error('Error al buscar el color:', error);
          }

          if (colorProduct) {
            colors.push(colorProduct);
          }

          let tagSku: string = await this.generateUniqueTagSku();
          const newProduct = {
            tagSku,
            supplierSku: product?.supplierSKu,
            apiCode: product?.apiCode,
            variantReferences: [],
            large: 0,
            width: 0,
            height: 0,
            weight: 0,
            medidas: product.medidas,
            colors,
            referencePrice: product.referencePrice,
            promoDisccount: product?.promoDisccount || 0,
            availableUnit: product?.availableUnit,
            refProduct,
            images: product.images
          };

          const productExists = await this.productRepository.findOne({
            where: {
              apiCode: newProduct.apiCode,
            },
          });

          console.log(productExists)
          if (productExists) {
            console.log("Producto regstrado")

            // Actualizar producto existente solo si el nuevo valor no es nulo o vacío
            productExists.tagSku = newProduct.tagSku || productExists.tagSku;
            productExists.supplierSku = newProduct.supplierSku || productExists.supplierSku;
            productExists.variantReferences = newProduct.variantReferences || productExists.variantReferences;
            productExists.large = newProduct.large || productExists.large;
            productExists.width = newProduct.width || productExists.width;
            productExists.height = newProduct.height || productExists.height;
            productExists.weight = newProduct.weight || productExists.weight;
            productExists.medidas = newProduct.medidas || productExists.medidas;
            productExists.referencePrice = newProduct.referencePrice || productExists.referencePrice;
            productExists.promoDisccount = newProduct.promoDisccount || productExists.promoDisccount;
            productExists.availableUnit = newProduct.availableUnit || productExists.availableUnit;
            productExists.refProduct = newProduct.refProduct || productExists.refProduct;
            productExists.colors = newProduct.colors.length > 0 ? newProduct.colors : productExists.colors;
            productExists.images = newProduct.images.length > 0 ? newProduct.images : productExists.images;

            const productsUpdates = await this.productRepository.save(productExists);
            console.log(productsUpdates);
          } else {
            const createdProduct: Product = this.productRepository.create(newProduct);
            const savedProduct: Product = await this.productRepository.save(createdProduct);
            console.log(savedProduct)
          }
        };



      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      throw new Error('Error al cargar los productos');
    }
  }
  // =========================================================







  // INTEGRACIONES PROMO OPCIONES
  // =========================================================
  private async loadPromoOpcionRefProducts() {

    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];


    // URL API
    const apiUrl = 'https://promocionalesenlinea.net/api/all-products';

    console.log(apiUrl)
    const bodyData = {
      user: 'COL0238',
      password: 'h1xSgEICLQB2nqE19y2k',
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };


    // CONSULTAMOS LA IFORMACIÓN DE LA EMPRESA Y ACCEDEMOS A SU PROVEEDOR
    const nameCompany = 'Promo Opciones';
    const company = await this.companyRepository.findOne({
      where: { name: nameCompany },
      relations: ['users', 'users.supplier'],
    });

    if (!company) {
      throw new NotFoundException(`Company with name ${nameCompany} not found`);
    }

    // ID DEL PROVEEDOR DE RODUCTO
    const supplierId = company?.users[0]?.supplier?.id




    try {
      const response = await axios.post(apiUrl, bodyData, config);

      const { success, response: responseData } = response.data;
      if (success) {
        const cantidadExistente = responseData.length;

        // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DEL REFERENCIAS
        const RefProductsNoCompleteCategory: any[] = [];
        let categorySupplierSearch: any;
        for (const item of responseData) {
          let keyword = item.nombrePadre;

          const images: Image[] = [];
          for (const imagen of item.imagenesPadre) {
            const newImage = {
              url: imagen,
            };

            const createdImage: Image = this.imageRepository.create(newImage);
            const savedImage: Image = await this.imageRepository.save(createdImage);

            images.push(savedImage);
          }

          // FILTRAMOS PARA QUE LAS CATEGORIAS QUE VIENEN MAL ACENTUADAS, SE ARREGLEN
          const normalizedCategoryName = this.normalizeCategoryName(item.categorias);

          // GUARDAMOS LAS CATEGRIAS NUEVAS
          categorySupplierSearch = await this.categorySupplierRepository.findOne({
            where: { origin: 'Promo_Opciones', name: normalizedCategoryName }, relations: ['categoryTag'],
          });

          if (!categorySupplierSearch) {
            // Crear nueva categoría
            categorySupplierSearch = this.categorySupplierRepository.create({
              offspringType: 'Principal',
              origin: 'Promo_Opciones',
              name: normalizedCategoryName,
              description: normalizedCategoryName,
              // Rellena otros campos necesarios
              supplier: company.users[0].supplier, // Asegúrate de que esté relacionado
              // Otros campos predeterminados si es necesario
            });
            categorySupplierSearch = await this.categorySupplierRepository.save(categorySupplierSearch);
          }


          const categorySuppliers: CategorySupplier[] = [];
          const categoryTags: CategoryTag[] = [];
          let categorySupplier: CategorySupplier = null;
          let categoryTag: CategoryTag = null;


          try {
            categorySupplier = await this.categorySupplierRepository.findOne({
              where: {
                name: normalizedCategoryName,
              },
              relations: ['categoryTag'],
            });
          } catch (error) {
            console.error('Error al buscar la categoría:', error);
          }

          if (categorySupplier) {
            try {
              categoryTag = await this.categoryTagRepository.findOne({
                where: {
                  id: categorySupplier.categoryTag?.id,
                },
              });
            } catch (error) {
              console.error('Error al buscar la etiqueta de categoría:', error);
            }

            if (categoryTag) {
              categoryTags.push(categoryTag);
            }

            categorySuppliers.push(categorySupplier);
          } else {
            RefProductsNoCompleteCategory.push(item.skuPadre)
            console.warn(`Categoría con nombre ${item.categorias} no encontrada.`);
            continue;
          }

          if (!categorySupplier)
            throw new NotFoundException(`Category not found`);


          // Inicializar el arreglo de colores sin refProductId
          const colors: Color[] = [];

          for (const material of item.hijos) {
            if (material.color) {
              // Buscar si el color ya existe en la base de datos
              let existingColor = await this.colorRepository.findOne({
                where: { name: material.color },
              });

              if (existingColor) {
                colors.push(existingColor);
              } else {
                // Si el color no existe, crearlo
                const newColor = this.colorRepository.create({
                  name: material.color,
                });

                const savedColor = await this.colorRepository.save(newColor);
                // Agregar el color creado a la lista de colores
                colors.push(savedColor);
              }
            }
          }



          let newRefProduct = {
            name: item.nombrePadre,
            referenceCode: item.skuPadre,
            shortDescription: item.nombrePadre,
            description: item.descripcion,
            mainCategory: categorySupplier?.id || '',
            tagCategory: categorySupplier?.categoryTag?.id || '',
            keywords: keyword,
            large: 0,
            width: 0,
            height: 0,
            weight: 0,
            medidas: item.medidas,
            importedNational: 1,
            markedDesignArea: item.impresion?.areaImpresion || '',
            supplier: company?.users[0]?.supplier,
            personalizableMarking: 0,
            images,
            colors,
          }

          cleanedRefProducts.push(newRefProduct);
          console.log(newRefProduct)
        }


        console.log(cleanedRefProducts)

        // INICIAMOS A GUARDAR LOS DATOS
        // INICIAMOS A GUARDAR LOS DATOS
        const refProductCodes: string[] = [];
        const refProductCodesString: string = refProductCodes.join(', ');
        const updatedProductsCode: string[] = [];
        const RefProductsExisting: any[] = [];
        const RefProductsExistingUpdate: any[] = [];

        // GUARDAMOS LAS REFERENCIAS INICIALMENTE
        for (const refProduct of cleanedRefProducts) {
          const refProductExists = await this.refProductRepository.findOne({
            where: { referenceCode: refProduct.referenceCode },
          });

          if (refProductExists) {
            RefProductsExisting.push(refProduct)
            console.log(`Ref product with reference code ${refProduct.referenceCode} is already registered`);

            // Crear un objeto de actualización con datos no vacíos
            const updatedRefProductData = {};
            for (const key in refProduct) {
              if (refProduct[key] !== '' && refProduct[key] !== null && refProduct[key] !== undefined) {
                updatedRefProductData[key] = refProduct[key];
              }
            }

            // Fusionar el objeto de actualización con los datos existentes
            const updatedRefProduct = {
              ...refProductExists,
              ...updatedRefProductData,
            };

            // Guardar la referencia actualizada
            const refProductUpdate = await this.refProductRepository.save(updatedRefProduct);
            console.log(refProductUpdate)
            RefProductsExistingUpdate.push(refProductUpdate)

          } else {
            const savedRefProduct: RefProduct = await this.refProductRepository.save(refProduct);
            refProductsToSave.push(savedRefProduct);
            console.log(savedRefProduct)
            // Actualizar refProductId en los colores asociados
            for (const color of savedRefProduct.colors) {
              color.refProductId = savedRefProduct.id;
              await this.colorRepository.save(color);
            }
          }
        }

        this.loadPromoOpcionProducts();

        return {
          response: refProductsToSave, RefProductsExistingUpdate
        };
      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      throw new Error('Error al cargar los productos');
    }
  }

  private async loadPromoOpcionProducts() {

    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // CONSULTA DE CANTIDAD
    const bodyDataStrock = {
      "user": "COL0238",
      "password": "h1xSgEICLQB2nqE19y2k"
    };


    // URL API STOCK PRODUCTOS
    const apiUrlStock = 'https://promocionalesenlinea.net/api/all-stocks';
    const responseStock = await axios.post(apiUrlStock, bodyDataStrock, config);

    const { success, Stocks } = responseStock.data;



    // URL API TODOS LOS PRODUCTOS
    const apiUrl = 'https://promocionalesenlinea.net/api/all-products';

    const bodyData = {
      user: 'COL0238',
      password: 'h1xSgEICLQB2nqE19y2k',
    };




    try {
      const response = await axios.post(apiUrl, bodyData, config);

      const { success, response: responseData } = response.data;
      if (success) {
        const cantidadExistente = responseData.length;

        console.log(responseData)
        // CONSULTAMOS LA IFORMACIÓN DE LA EMPRESA Y ACCEDEMOS A SU PROVEEDOR
        const nameCompany = 'Promo Opciones';
        const company = await this.companyRepository.findOne({
          where: { name: nameCompany },
          relations: ['users', 'users.supplier'],
        });

        if (!company) {
          throw new NotFoundException(`Company with name ${nameCompany} not found`);
        }

        console.log(company)


        // ID DEL PROVEEDOR DE RODUCTO
        const supplierId = company?.users[0]?.supplier?.id

        // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DE LOS PRODUCTOS
        const RefProductsNoCompleteCategory: any[] = [];
        let foundProduct = false;  // Variable de control quitar esto

        for (const item of responseData) {
          let keyword = item.nombrePadre;
          console.log(item)


          for (const material of item.hijos) {

            const productImages: Image[] = [];
            for (const imagen of material.imagenesHijo) {
              const newImage = {
                url: imagen,
              };
              const createdImage: Image = this.imageRepository.create(newImage);
              const savedImage: Image = await this.imageRepository.save(createdImage);
              productImages.push(savedImage);
            }

            let cantidadProducto = 0;

            for (const stockPro of Stocks) {
              cantidadProducto = stockPro.Stock || 0;
            }

            for (const imagen of material.imagenesHijo) {
              const image: Image = this.imageRepository.create({
                url: imagen,
              });

              await this.imageRepository.save(image);
              productImages.push(image);
            }

            let tagSku: string = await this.generateUniqueTagSku();
            const newProduct = {
              tagSku,
              availableUnit: cantidadProducto || 0,
              referencePrice: 0,
              promoDisccount: 0,
              familia: item.skuPadre,
              supplierSKu: material.skuHijo,
              apiCode: material.skuHijo,
              large: 0,
              width: 0,
              height: 0,
              weight: 0,
              material,
              medidas: item.medidas,
              color: material.color,
              images: productImages
            };

            productsToSave.push(newProduct);
            console.log(newProduct)
          };
        }


        // INICIAMOS A GUARDAR LOS DATOS
        const refProductCodes: string[] = [];
        const refProductCodesString: string = refProductCodes.join(', ');
        const updatedProductsCode: string[] = [];
        const RefProductsExisting: any[] = [];

        const productsInDb = await this.productRepository.find();


        //GUARDAMOS LOS PRODUCTOS RELACIONADAS A LA REFERENCIA
        for (const product of productsToSave) {
          const refProduct = await this.refProductRepository.findOne({
            where: {
              referenceCode: product.familia,
            },
          });

          if (!refProduct)
            throw new NotFoundException(`Ref product for product with familia ${product.familia} not found`);

          const productColor: string = product?.color?.toLowerCase() || '';


          let colorProduct: Color;
          const colors: Color[] = [];

          try {
            colorProduct = await this.colorRepository.findOne({
              where: {
                name: product.color,
              }
            });
          } catch (error) {
            console.error('Error al buscar el color:', error);
          }

          if (colorProduct) {
            colors.push(colorProduct);
          }

          let tagSku: string = await this.generateUniqueTagSku();
          const newProduct = {
            tagSku,
            supplierSku: product?.supplierSKu,
            apiCode: product?.apiCode,
            variantReferences: [],
            large: 0,
            width: 0,
            height: 0,
            weight: 0,
            medidas: product.medidas,
            colors,
            referencePrice: product.referencePrice,
            promoDisccount: product?.promoDisccount || 0,
            availableUnit: product?.availableUnit,
            refProduct,
            images: product.images
          };

          const productExists = await this.productRepository.findOne({
            where: {
              apiCode: newProduct.apiCode,
            },
          });

          console.log(productExists)
          if (productExists) {
            console.log("Producto regstrado")

            // Actualizar producto existente solo si el nuevo valor no es nulo o vacío
            productExists.tagSku = newProduct.tagSku || productExists.tagSku;
            productExists.supplierSku = newProduct.supplierSku || productExists.supplierSku;
            productExists.variantReferences = newProduct.variantReferences || productExists.variantReferences;
            productExists.large = newProduct.large || productExists.large;
            productExists.width = newProduct.width || productExists.width;
            productExists.height = newProduct.height || productExists.height;
            productExists.weight = newProduct.weight || productExists.weight;
            productExists.medidas = newProduct.medidas || productExists.medidas;
            productExists.referencePrice = newProduct.referencePrice || productExists.referencePrice;
            productExists.promoDisccount = newProduct.promoDisccount || productExists.promoDisccount;
            productExists.availableUnit = newProduct.availableUnit || productExists.availableUnit;
            productExists.refProduct = newProduct.refProduct || productExists.refProduct;
            productExists.colors = newProduct.colors.length > 0 ? newProduct.colors : productExists.colors;
            productExists.images = newProduct.images.length > 0 ? newProduct.images : productExists.images;

            const productsUpdates = await this.productRepository.save(productExists);
            console.log(productsUpdates);
          } else {
            const createdProduct: Product = this.productRepository.create(newProduct);
            const savedProduct: Product = await this.productRepository.save(createdProduct);
            console.log(savedProduct)
          }
        };



      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      throw new Error('Error al cargar los productos');
    }
  }
  // =========================================================






  // INTEGRACIONES CDO PROMOSIONES
  // =========================================================
  private async loadCDO_PromocionesRefProducts() {

    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const apiUrl = 'http://api.colombia.cdopromocionales.com/v2/products';
    const authToken = 'GpW1y2YseY76cVk08qkTAQ';

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.get(apiUrl, {
      params: {
        auth_token: authToken,
      },
      ...config,
    });

    // CONSULTAMOS LA IFORMACIÓN DE LA EMPRESA Y ACCEDEMOS A SU PROVEEDOR
    const nameCompany = 'CDO PROMOCIONALES';
    const company = await this.companyRepository.findOne({
      where: { name: nameCompany },
      relations: ['users', 'users.supplier'],
    });

    if (!company) {
      throw new NotFoundException(`Company with name ${nameCompany} not found`);
    }


    if (response.status === 200) {
      const products = response.data;
      // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DEL REFERENCIAS

      const RefProductsNoCompleteCategory: any[] = [];
      let categorySupplierSearch;

      let idCtaegory: any;

      for (const item of products) {
        let keyword = item.name;

        // Verificar si item.categories es un array
        if (Array.isArray(item.categories)) {
          for (const category of item.categories) {
            categorySupplierSearch = await this.categorySupplierRepository.findOne({
              where: { origin: 'CDO', apiReferenceId: category.id }, relations: ['categoryTag'],
            });


            if (!categorySupplierSearch) {
              // Crear nueva categoría
              categorySupplierSearch = this.categorySupplierRepository.create({
                offspringType: 'Principal',
                origin: 'CDO',
                name: category.name,
                description: category.name,
                apiReferenceId: category.id,
                // Rellena otros campos necesarios
                supplier: company.users[0].supplier, // Asegúrate de que esté relacionado
                // Otros campos predeterminados si es necesario
              });
              categorySupplierSearch = await this.categorySupplierRepository.save(categorySupplierSearch);
            }

            idCtaegory = categorySupplierSearch.id || 0;
            console.log(idCtaegory)

          }
        } else {
          console.warn(`item.categories no es un array:`, item.categories);
        }

        const categorySuppliers: CategorySupplier[] = [];
        const categoryTags: CategoryTag[] = [];
        let categorySupplier: CategorySupplier = null;
        let categoryTag: CategoryTag = null;

        categorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            origin: 'CDO', id: idCtaegory,
          },
          relations: ['categoryTag'],
        });


        console.log(categorySupplier)
        if (categorySupplier) {
          try {
            categoryTag = await this.categoryTagRepository.findOne({
              where: {
                id: categorySupplier.categoryTag?.id,
              },
            });
          } catch (error) {
            console.error('Error al buscar la etiqueta de categoría:', error);
          }

          if (categoryTag) {
            categoryTags.push(categoryTag);
          }

          categorySuppliers.push(categorySupplier);
        } else {
          RefProductsNoCompleteCategory.push(item.skuPadre)
          console.warn(`Categoría con nombre ${item.categorias} no encontrada.`);
          continue;
        }

        if (!categorySupplier)
          throw new NotFoundException(`Category not found`);

        // Inicializar el arreglo de colores sin refProductId
        const colors: Color[] = [];

        for (const material of item.variants) {
          if (material.color) {
            // Buscar si el color ya existe en la base de datos
            let existingColor = await this.colorRepository.findOne({
              where: { name: material.color.name },
            });

            if (existingColor) {
              // Si el color existe y no tiene valor hexadecimal, actualizarlo
              if (!existingColor.hexadecimalValue) {
                existingColor.hexadecimalValue = material.color.hexadecimalValue || '';
                existingColor = await this.colorRepository.save(existingColor);
              }
              // Agregar el color existente a la lista de colores
              colors.push(existingColor);
            } else {
              // Si el color no existe, crearlo
              const newColor = this.colorRepository.create({
                name: material.color.name,
                hexadecimalValue: material.color.hexadecimalValue || '',
              });

              const savedColor = await this.colorRepository.save(newColor);
              // Agregar el color creado a la lista de colores
              colors.push(savedColor);
            }
          }
        }

        let newRefProduct = {
          name: item.name,
          referenceCode: item.code,
          shortDescription: item.description,
          description: item.description,
          mainCategory: categorySupplier?.id || '',
          tagCategory: categorySupplier?.categoryTag?.id || '',
          keywords: keyword,
          large: 0,
          width: 0,
          height: 0,
          weight: 0,
          importedNational: 1,
          supplier: company?.users[0]?.supplier,
          personalizableMarking: 0,
          colors,
        }

        cleanedRefProducts.push(newRefProduct);
        console.log(cleanedRefProducts)
      }


      // INICIAMOS A GUARDAR LOS DATOS
      const refProductCodes: string[] = [];
      const refProductCodesString: string = refProductCodes.join(", ");
      const updatedProductsCode: string[] = [];
      const RefProductsExisting: any[] = [];
      const RefProductsExistingUpdate: any[] = [];

      // GUARDAMOS LAS REFERENCIAS INICIALMENTE
      for (const refProduct of cleanedRefProducts) {
        const refProductExists = await this.refProductRepository.findOne({
          where: { referenceCode: refProduct.referenceCode },
        });

        if (refProductExists) {
          RefProductsExisting.push(refProduct);
          console.log(
            `Ref product with reference code ${refProduct.referenceCode} is already registered`
          );

          // Crear un objeto de actualización con datos no vacíos
          const updatedRefProductData = {};
          for (const key in refProduct) {
            if (
              refProduct[key] !== "" &&
              refProduct[key] !== null &&
              refProduct[key] !== undefined
            ) {
              updatedRefProductData[key] = refProduct[key];
            }
          }

          // Fusionar el objeto de actualización con los datos existentes
          const updatedRefProduct = {
            ...refProductExists,
            ...updatedRefProductData,
          };

          // Guardar la referencia actualizada
          const refProductUpdate = await this.refProductRepository.save(
            updatedRefProduct
          );
          console.log("-");
          RefProductsExistingUpdate.push(refProductUpdate);
        } else {
          const savedRefProduct: RefProduct =
            await this.refProductRepository.save(refProduct);
          refProductsToSave.push(savedRefProduct);
          console.log("-");
          // Actualizar refProductId en los colores asociados
          for (const color of savedRefProduct.colors) {
            color.refProductId = savedRefProduct.id;
            await this.colorRepository.save(color);
          }
        }
      }
    }
    return response
  }


  private async loadCDO_PromocionesProducts() {

    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const apiUrl = 'http://api.colombia.cdopromocionales.com/v2/products';
    const authToken = 'GpW1y2YseY76cVk08qkTAQ';

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.get(apiUrl, {
      params: {
        auth_token: authToken,
      },
      ...config,
    });

    if (response.status === 200) {
      const products = response.data;
      // COMENZAMOS A ARMAR EL ARREGLO DE DATOS DEL REFERENCIAS

      for (const item of products) {
        for (const material of item.variants) {
          // Colección de Imagenes
          const productImages: Image[] = [];
          const imageUrls = Object.values(material.picture) as string[];

          // Guardamos la imagen
          const newImage = { url: material?.picture?.original };
          const createdImage: Image = this.imageRepository.create(newImage);
          const savedImage: Image = await this.imageRepository.save(createdImage);
          productImages.push(savedImage);


          // Verificación para material.color
          const colorName = material.color ? material.color.name : '';
          const hexadecimalValue = material.color ? material.color.hexadecimalValue : '';

          // Verificación para color en base de datos
          let color: Color;
          color = await this.colorRepository.findOne({ where: { name: colorName } });

          if (!color) {
            color = this.colorRepository.create({ name: colorName, hexadecimalValue });
            color = await this.colorRepository.save(color);
          } else if (!color.hexadecimalValue) {
            color.hexadecimalValue = hexadecimalValue;
            color = await this.colorRepository.save(color);
          }

          // Organizamos los datos
          let tagSku: string = await this.generateUniqueTagSku();
          const newProduct = {
            tagSku,
            availableUnit: material.stock_available || 0,
            referencePrice: parseInt(material.list_price),
            promoDisccount: 0,
            familia: item.code,
            supplierSKu: item.code,
            apiCode: material.id,
            large: 0,
            width: 0,
            height: 0,
            weight: 0,
            material,
            color: color.name,
            images: productImages
          };

          productsToSave.push(newProduct);
          console.log(newProduct);
        }
      }

    }


    console.log(productsToSave)

    // INICIAMOS A GUARDAR LOS DATOS
    const refProductCodes: string[] = [];

    //GUARDAMOS LOS PRODUCTOS RELACIONADAS A LA REFERENCIA
    for (const product of productsToSave) {
      const refProduct = await this.refProductRepository.findOne({
        where: {
          referenceCode: product.familia
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product for product with familia ${product.familia} not found`);

      const productColor: string = product?.color?.toLowerCase() || '';


      let colorProduct: Color;
      const colors: Color[] = [];

      try {
        colorProduct = await this.colorRepository.findOne({
          where: {
            name: product.color,
          }
        });
      } catch (error) {
        console.error('Error al buscar el color:', error);
      }

      if (colorProduct) {
        colors.push(colorProduct);
      }

      let tagSku: string = await this.generateUniqueTagSku();
      const newProduct = {
        tagSku,
        supplierSku: product?.supplierSKu,
        apiCode: product?.apiCode,
        variantReferences: [],
        large: 0,
        width: 0,
        height: 0,
        weight: 0,
        referencePrice: product.referencePrice,
        colors,
        availableUnit: product?.availableUnit,
        refProduct,
        images: product.images
      };

      const productExists = await this.productRepository.findOne({
        where: {
          apiCode: newProduct.apiCode,
        },
      });

      console.log(productExists)
      if (productExists) {
        console.log("--")

        // Actualizar producto existente solo si el nuevo valor no es nulo o vacío
        productExists.tagSku = newProduct.tagSku || productExists.tagSku;
        productExists.supplierSku = newProduct.supplierSku || productExists.supplierSku;
        productExists.variantReferences = newProduct.variantReferences || productExists.variantReferences;
        productExists.large = newProduct.large || productExists.large;
        productExists.width = newProduct.width || productExists.width;
        productExists.height = newProduct.height || productExists.height;
        productExists.weight = newProduct.weight || productExists.weight;
        productExists.referencePrice = newProduct.referencePrice;
        productExists.availableUnit = newProduct.availableUnit || productExists.availableUnit;
        productExists.refProduct = newProduct.refProduct || productExists.refProduct;
        productExists.colors = newProduct.colors.length > 0 ? newProduct.colors : productExists.colors;
        productExists.images = newProduct.images.length > 0 ? newProduct.images : productExists.images;

        const productsUpdates = await this.productRepository.save(productExists);
        console.log(productsUpdates);
      } else {
        const createdProduct: Product = this.productRepository.create(newProduct);
        const savedProduct: Product = await this.productRepository.save(createdProduct);
        console.log(savedProduct)
        console.log("--")

      }
    };

  }
  // =========================================================








  // INTEGRACIONES DE PROMOS
  // =========================================================
  private readonly categoriesUrl = 'http://api.cataprom.com/rest/categorias';
  private readonly productsBaseUrl = 'http://api.cataprom.com/rest/categorias';

  async loadPromosRefProducts() {
    // ARREGLOS GENERALES
    const refProductsToSave = [];
    const productsToSave = [];
    const cleanedRefProducts = [];

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let productosData: any;
    let categoriasData: any;

    console.log("--")
    try {
      // Consumir la primera API para obtener el listado de categorías
      const categoriasResponse = await axios.get(this.categoriesUrl, config);

      if (!categoriasResponse.data.success) {
        // throw new HttpException('Error al obtener categorías', HttpStatus.BAD_REQUEST);
      }

      categoriasData = categoriasResponse.data;
      // Verificar si categoriasData.resultado es un iterable (array)
      if (!Array.isArray(categoriasData.resultado)) {
        // throw new HttpException('El resultado de las categorías no es una matriz', HttpStatus.BAD_REQUEST);
      }

      // Inicializar una lista para almacenar las primeras dos categorías
      const selectedCategorias = [];
      const maxCategorias = 2; // Cambia esto al número deseado de categorías

      // Recorrer las categorías y consumir la segunda API para obtener productos
      for (const categoria of categoriasData.resultado) {
        if (selectedCategorias.length >= maxCategorias) {
          break; // Sal del bucle después de obtener el número deseado de categorías
        }

        const idCategoria = categoria.id;
        const productosResponse = await axios.get(`${this.productsBaseUrl}/${idCategoria}/productos`, config);

        if (productosResponse.data.success) {
          productosData = productosResponse.data;

          console.log(productosData)
          // Verificar si productosData.resultado es un objeto
          if (typeof productosData.resultado === 'object') {
            selectedCategorias.push(productosData.resultado);
          }
        } else {
          // Manejar errores específicos de la solicitud de productos
          console.error(`Error al obtener productos de categoría ${idCategoria}`);
        }
      }

      // Aquí puedes procesar y almacenar los productos obtenidos
      // Por ejemplo, podrías agregar lógica para llenar refProductsToSave, productsToSave, y cleanedRefProducts

      // Enviar la lista de las primeras dos categorías como resultado
      return {
        categorias: categoriasData,
        productosData
      };

    } catch (error) {
      console.error(error);
      // throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =========================================================







  //* ---------- LOAD ALL PRODUCTS FROM EXT APIS ---------- *//
  async loadProducts(supplier: string) {
    const supplierName: string = supplier || '';
    console.log(supplierName)

    if (supplierName.toLowerCase().trim() == 'marpico') {
      await this.loadMarpicoRefProducts();
    } else if (supplierName.toLowerCase().trim() == 'promos') {
      await this.loadPromosRefProducts();
    } else if (supplierName.toLowerCase().trim() == 'promoopciones') {
      await this.loadPromoOpcionRefProducts();
    } else if (supplierName.toLowerCase().trim() == 'cdo') {
      await this.loadCDO_PromocionesProducts();
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
      .leftJoin('refProduct.categorySuppliers', 'refProductCategorySuppliers')
      .leftJoin('refProduct.categoryTags', 'refProductCategoryTag')
      .leftJoin('refProduct.colors', 'refProductColors')
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

  async requireProduct(requireProductDto: RequireProductDto, file: Express.Multer.File, tipo=0) {
    const {
      name,
      email,
      phone,
      productName,
      quantity,
      productDescription
    } = requireProductDto;

    let suscriptores: any[] = [];
    let image: string;

    if (tipo == 1) {

      let suscriptoresData = await this.suscriptionRepository.find();

      for (const emails of suscriptoresData) {
        suscriptores.push(emails.email)
      }

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
            filename: file.originalname,
            path: image,
            cid: image
          });
        }

        await transporter.sendMail({
          from: this.emailSenderConfig.transport.from,
          to: suscriptores,
          subject: 'Nuevas Ofertas y Descuentos Esperan por Ti en E-Bulky',
          html:
            `
            <div class= "container" style="width: 100 %; background- color: #f1f3f5;padding: 5em 0">
                  <nav style = "width: 100%; height: 6em; background-color: #0a54f2" > </nav>
                    <div class="container" style = "
                          background - color: white;
                          width: 80 %;
                          border - radius: 5px;
                          position: relative;
                          top: -50px;
                          margin: auto;
                          display: flex;
                          justify - content: start;
                          padding: 3em 3em;
                          flex - direction: column;
                          align - items: center;
                          ">
                          <div class="logo" style = "margin-right:1em" >
                            <img style="width:80%; margin: 2em"  src = "https://tag-web-16776.web.app/assets/icon/logo.png" alt = "" />
                              <hr>
                              <div class="contenido" style = "padding:0.7em 2em" >
                                <h1>Bienvenido / a! </h1>
                                
                                  <p style="color: #0a54f2;">Hola!</p>
                                    <p>Te damos una cálida bienvenida a nuestra familia E-Bulky. Estamos encantados de tenerte con nosotros y estamos comprometidos a mejorar cada día para ofrecerte lo que necesitas.</p>
                                    <p>¡Descubre nuestro nuevo portafolio de productos, promociones exclusivas, descuentos irresistibles y muchos otros servicios diseñados para ti!</p>
                                    
                                    <h2>Nuestras Ofertas Exclusivas:</h2>
                                    <ul>
                                        <li>Descuentos de hasta el 50% en productos seleccionados.</li>
                                        <li>Promociones de temporada.</li>
                                        <li>Nuevas llegadas cada semana.</li>
                                    </ul>
                                    
                                    <p>No te pierdas estas increíbles oportunidades. ¡Regístrate ahora en nuestra plataforma para acceder a estas ofertas y más!</p>

                                    <a style = "padding: .7em 2em; background: #0a54f2; color:white" target = "_black" href="https://e-bulky.com/" class="button">Regístrate en E-Bulky</a>
                                    
                                    <p>Gracias por elegirnos. Estamos aquí para hacer tu experiencia de compra más fácil y gratificante.</p>

                                    <p>Saludos cordiales,<br>El equipo de E-Bulky</p>

                                    <p>P.S. Abajo encontrarás nuestro portafolio en formato PDF. ¡No te lo pierdas!</p>
                                    
                                </br>
                                </br>
                                </br>

                                <p> Ingresa al boton de abajo y deja tu comentario si deseas cancelar tu suscripción, !Gracias¡</p>
                                </br>
                                <a style = "padding: .7em 2em; background: #0a54f2; color:white" target = "_black" href="http://localhost:4200/app/home/unsubscribe?dataUser=6">!Cancelar suscripción!</a>
                              </div>
                          </div>
                      </div>
              </div>
        `,
          attachments: attachments
        });
      } catch (error) {
        console.log('Failed to send the product request email', error);
        throw new InternalServerErrorException(`Internal server error`);
      }

    } else {
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
          filename: 'producto.png',
          path: image,
          cid: image
        });
      }

      await transporter.sendMail({
        from: this.emailSenderConfig.transport.from,
        to: ['puertodaniela586@gmail.com', 'locarr785@gmail.com', 'zoomm.yeison@gmail.com'],
        subject: 'Solicitud de producto',
        html: `
        <div class="container" style="
                width: 100%;
                background-color: #f1f3f5;
                padding:5em 0">
                <nav style="width: 100%; height: 6em; background-color: #0a54f2"></nav>
                <div class="container" style="
                  background-color: white;
                  width: 80%;
                  border-radius: 5px;
                  position: relative;
                  top: -50px;
                  margin: auto;
                  display: flex;
                    justify-content: start;
                    padding: 3em 3em ;
                    flex-direction: column;
                    align-items: center;
                ">
                    <div class="logo">
                        <img  src="https://tag-web-16776.web.app/assets/icon/logo.png" alt="" />
                    </div>
                    <hr>
                    <div class="contenido">
                    <h1>Solicitud de Producto Nuevo</h1>
                    <p>Nombre: ${name}</p>
                    <p>Correo electrónico: ${email}</p>
                    <p>Teléfono: ${phone}</p>
                    <p>Nombre del producto: ${productName}</p>
                    <p>Cantidad: ${quantity}</p>
                    <p>Descripción del producto: ${productDescription}</p>
                    ${image ? '<img src="cid:unique@nodemailer.com" />' : ''}
                    </div>
                </div>
            </div>
        `,
        attachments: attachments
      });
    } catch (error) {
      console.log('Failed to send the product request email', error);
      throw new InternalServerErrorException(`Internal server error`);
    }
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