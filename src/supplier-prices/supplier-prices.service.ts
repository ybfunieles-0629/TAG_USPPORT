import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSupplierPriceDto } from './dto/create-supplier-price.dto';
import { UpdateSupplierPriceDto } from './dto/update-supplier-price.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Product } from '../products/entities/product.entity';
import { ListPrice } from '../list-prices/entities/list-price.entity';
import { plainToClass } from 'class-transformer';
import { SupplierPrice } from './entities/supplier-price.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SupplierPricesService {
  constructor(
    @InjectRepository(SupplierPrice)
    private readonly supplierPriceRepository: Repository<SupplierPrice>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ListPrice)
    private readonly listPriceRepository: Repository<ListPrice>,
  ) { }

  async create(createSupplierPriceDto: CreateSupplierPriceDto) {
    const newSupplierPrice = plainToClass(SupplierPrice, createSupplierPriceDto);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createSupplierPriceDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${createSupplierPriceDto.supplier} not found`);

    if (!supplier.isActive)
      throw new NotFoundException(`Supplier with id ${createSupplierPriceDto.supplier} is currently inactive`);

    const product = await this.productRepository.findOne({
      where: {
        id: createSupplierPriceDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createSupplierPriceDto.product} not found`);

    if (!product.isActive)
      throw new NotFoundException(`Product with id ${createSupplierPriceDto.product} is currently inactive`);

    const listPrices: ListPrice[] = [];

    if (createSupplierPriceDto.listPrices) {
      for (const listPriceId of createSupplierPriceDto.listPrices) {
        const listPrice = await this.listPriceRepository.findOne({
          where: {
            id: listPriceId,
          },
        });

        if (!listPrice)
          throw new NotFoundException(`List price with id ${listPriceId} not found`);

        if (!listPrice.isActive)
          throw new NotFoundException(`List price with id ${listPriceId} is currently inactive`);

        listPrices.push(listPrice);
      }

      newSupplierPrice.listPrices = listPrices;
    }

    newSupplierPrice.supplier = supplier;
    newSupplierPrice.product = product;

    await this.supplierPriceRepository.save(newSupplierPrice);

    return {
      newSupplierPrice
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.supplierPriceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'supplier',
        'product',
        'listPrice'
      ],
    });
  }

  async findOne(id: string) {
    const supplierPrice = await this.supplierPriceRepository.findOne({
      where: {
        id,
      },
    });

    if (!supplierPrice)
      throw new NotFoundException(`Supplier price with id ${id} not found`);

    return {
      supplierPrice
    };
  }

  async update(id: string, updateSupplierPriceDto: UpdateSupplierPriceDto) {
    const supplierPrice = await this.supplierPriceRepository.findOne({
      where: {
        id,
      },
    });

    if (!supplierPrice)
      throw new NotFoundException(`Supplier price with id ${id} not found`);

    const updatedSupplierPrice = plainToClass(SupplierPrice, updateSupplierPriceDto);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: updateSupplierPriceDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${updateSupplierPriceDto.supplier} not found`);

    if (!supplier.isActive)
      throw new NotFoundException(`Supplier with id ${updateSupplierPriceDto.supplier} is currently inactive`);

    const product = await this.productRepository.findOne({
      where: {
        id: updateSupplierPriceDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${updateSupplierPriceDto.product} not found`);

    if (!product.isActive)
      throw new NotFoundException(`Product with id ${updateSupplierPriceDto.product} is currently inactive`);

    const listPrices: ListPrice[] = [];

    if (updateSupplierPriceDto.listPrices) {
      for (const listPriceId of updateSupplierPriceDto.listPrices) {
        const listPrice = await this.listPriceRepository.findOne({
          where: {
            id: listPriceId,
          },
        });

        if (!listPrice)
          throw new NotFoundException(`List price with id ${listPriceId} not found`);

        if (!listPrice.isActive)
          throw new NotFoundException(`List price with id ${listPriceId} is currently inactive`);

        listPrices.push(listPrice);
      }


      updatedSupplierPrice.listPrices = listPrices;
    }

    updatedSupplierPrice.supplier = supplier;
    updatedSupplierPrice.product = product;

    Object.assign(supplierPrice, updatedSupplierPrice);

    await this.supplierPriceRepository.save(supplierPrice);

    return {
      supplierPrice
    };
  }

  async remove(id: string) {
    const { supplierPrice } = await this.findOne(id);

    await this.supplierPriceRepository.remove(supplierPrice);

    return {
      supplierPrice
    };
  }
}
