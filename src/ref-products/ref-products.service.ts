import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import axios from 'axios';

import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { RefProduct } from './entities/ref-product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Marking } from '../markings/entities/marking.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';
import { DeliveryTime } from '../delivery-times/entities/delivery-time.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefProductsService {
  private readonly logger: Logger = new Logger('RefProductsService');

  constructor(
    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async manageProductsFromExtApi(data: any) {
    const productsToSave = [];
    const cleanedProducts = [];

    const productsInDb = await this.refProductRepository.find();

    const user = await this.userRepository.findOne({
      where: {
        name: 'Promos',
      },
      relations: [
        'supplier',
      ],
    });

    if (!user)
      throw new NotFoundException(`User from promos not found`);

    for (const item of data) {
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

      let product = {
        "name": item.descripcion_comercial,
        "referenceCode": item.familia,
        "referenceTagCode": null,
        "shortDescription": item.descripcion_comercial,
        "description": item.descripcion_larga,
        "mainCategory": null,
        "keywords": keyword,
        "large": item.empaque_largo,
        "width": item.empaque_ancho,
        "height": item.empaque_alto,
        "weight": item.empaque_peso_bruto,
        "importedNational": "1",
        "minQuantity": null,
        "productInventoryLeadTime": null,
        "productNoInventoryLeadTime": null,
        "markedDesignArea": item.area_impresion,
        "supplier": user.supplier.id,
        "personalizableMarking": 0
      }

      cleanedProducts.push(product);
    }

    for (const product of cleanedProducts) {
      const productExists = productsInDb.some(productInDb => productInDb.referenceCode == product.referenceCode);

      if (productExists) {
        console.log(`Product with reference code ${product.referenceCode} is already registered`);
      } else {
        await this.refProductRepository.save(product);
        productsToSave.push(product);
      }
    }

    if (productsToSave.length === 0)
      throw new BadRequestException(`There are no new products to save`);

    return {
      productsToSave
    };
  }

  async loadProductsFromExtApi() {
    const apiUrl = 'https://marpicoprod.azurewebsites.net/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const config = {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    };

    const { data: { results } } = await axios.get(apiUrl, config);

    await this.manageProductsFromExtApi(results);
  }

  async create(createRefProductDto: CreateRefProductDto) {
    try {
      const newRefProduct = plainToClass(RefProduct, createRefProductDto);

      const supplier: Supplier = await this.supplierRepository.findOne({
        where: {
          id: createRefProductDto.supplier,
        },
      });

      if (!supplier)
        throw new NotFoundException(`Suppplier with id ${createRefProductDto.supplier} not found`);

      if (!supplier.isActive)
        throw new BadRequestException(`Supplier with id ${createRefProductDto.supplier} is currently inactive`);

      newRefProduct.supplier = supplier;

      const categorySuppliers: CategorySupplier[] = [];
      const deliveryTimes: DeliveryTime[] = [];

      if (createRefProductDto.categorySuppliers) {
        for (const categorySupplierId of createRefProductDto.categorySuppliers) {
          const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
            where: {
              id: categorySupplierId,
            },
          });

          if (!categorySupplier)
            throw new NotFoundException(`Marking with id ${categorySupplierId} not found`);

          if (!categorySupplier.isActive)
            throw new BadRequestException(`Marking with id ${categorySupplierId} is currently inactive`);

          categorySuppliers.push(categorySupplier);
        }
      }

      if (createRefProductDto.deliveryTimes) {
        for (const deliveryTimeId of createRefProductDto.deliveryTimes) {
          const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
            where: {
              id: deliveryTimeId,
            },
          });

          if (!deliveryTime)
            throw new NotFoundException(`Delivery time with id ${deliveryTimeId} not found`);

          // if (!deliveryTime.isActive)
          //   throw new BadRequestException(`Delivery time with id ${deliveryTime} is currently inactive`);

          deliveryTimes.push(deliveryTime);
        }
      }

      newRefProduct.categorySuppliers = categorySuppliers;
      newRefProduct.deliveryTimes = deliveryTimes;

      await this.refProductRepository.save(newRefProduct);

      return {
        newRefProduct
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.refProductRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'deliveryTimes',
        'markings',
        'supplier',
      ],
    });
  }

  async findOne(id: string) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'deliveryTimes',
        'markings',
        'supplier',
      ],
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    return {
      refProduct
    };
  }

  async update(id: string, updateRefProductDto: UpdateRefProductDto) {
    const refProduct = await this.refProductRepository.findOne({
      where: {
        id,
      },
      relations: [
        'deliveryTimes',
        'supplier',
        'markings',
      ],
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    const updatedRefProduct = plainToClass(RefProduct, updateRefProductDto);

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: updateRefProductDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Suppplier with id ${updateRefProductDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${updateRefProductDto.supplier} is currently inactive`);

    const categorySuppliers: CategorySupplier[] = [];
    const deliveryTimes: DeliveryTime[] = [];

    if (updateRefProductDto.categorySuppliers) {
      for (const categorySupplierId of updateRefProductDto.categorySuppliers) {
        const categorySupplier: CategorySupplier = await this.categorySupplierRepository.findOne({
          where: {
            id: categorySupplierId,
          },
        });

        if (!categorySupplier)
          throw new NotFoundException(`Marking with id ${categorySupplierId} not found`);

        if (!categorySupplier.isActive)
          throw new BadRequestException(`Marking with id ${categorySupplierId} is currently inactive`);

        categorySuppliers.push(categorySupplier);
      }
    }

    if (updateRefProductDto.deliveryTimes) {
      for (const deliveryTimeId of updateRefProductDto.deliveryTimes) {
        const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
          where: {
            id: deliveryTimeId,
          },
        });

        if (!deliveryTime)
          throw new NotFoundException(`Delivery time with id ${deliveryTimeId} not found`);

        // if (!deliveryTime.isActive)
        //   throw new BadRequestException(`Delivery time with id ${deliveryTime} is currently inactive`);

        deliveryTimes.push(deliveryTime);
      }
    }

    updatedRefProduct.supplier = supplier;
    updatedRefProduct.categorySuppliers = categorySuppliers;
    updatedRefProduct.deliveryTimes = deliveryTimes;

    Object.assign(refProduct, updatedRefProduct);

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async desactivate(id: string) {
    const { refProduct } = await this.findOne(id);

    refProduct.isActive = !refProduct.isActive;

    await this.refProductRepository.save(refProduct);

    return {
      refProduct
    };
  }

  async remove(id: string) {
    const { refProduct } = await this.findOne(id);

    await this.refProductRepository.remove(refProduct);

    return {
      refProduct
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
