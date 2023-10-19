import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreateDeliveryTimeDto } from './dto/create-delivery-time.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-time.dto';
import { DeliveryTime } from './entities/delivery-time.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Product } from '../products/entities/product.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class DeliveryTimesService {
  private readonly logger: Logger = new Logger('DeliveryTimesService');

  constructor(
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createDeliveryTimeDto: CreateDeliveryTimeDto) {
    const newDeliveryTime = plainToClass(DeliveryTime, createDeliveryTimeDto);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createDeliveryTimeDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${createDeliveryTimeDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${createDeliveryTimeDto.supplier} is currently inactive`);

    const product = await this.productRepository.findOne({
      where: {
        id: createDeliveryTimeDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createDeliveryTimeDto.product} not found`);

    if (!product.isActive)
      throw new BadRequestException(`Product with id ${createDeliveryTimeDto.product} is currently inactive`);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createDeliveryTimeDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createDeliveryTimeDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${createDeliveryTimeDto.refProduct} is currently inactive`);

    newDeliveryTime.supplier = supplier;
    newDeliveryTime.product = product;
    newDeliveryTime.refProduct = refProduct;

    await this.deliveryTimeRepository.save(newDeliveryTime);

    return {
      newDeliveryTime
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.deliveryTimeRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'supplier',
        'product',
        'refProduct',
      ],
    });
  }

  async findOne(id: string) {
    const deliveryTime: DeliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplier',
        'product',
        'refProduct',
      ],
    });

    if (!deliveryTime)
      throw new NotFoundException(`Delivery time with id ${id} not found`);

    return {
      deliveryTime
    };
  }

  async update(id: string, updateDeliveryTimeDto: UpdateDeliveryTimeDto) {
    const deliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id,
      },
      relations: [
        'supplier',
        'product',
        'refProduct',
      ],
    });

    const updatedDeliveryTime = plainToClass(DeliveryTime, updateDeliveryTimeDto);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id: updateDeliveryTimeDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${updateDeliveryTimeDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${updateDeliveryTimeDto.supplier} is currently inactive`);

    const product = await this.productRepository.findOne({
      where: {
        id: updateDeliveryTimeDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${updateDeliveryTimeDto.product} not found`);

    if (!product.isActive)
      throw new BadRequestException(`Product with id ${updateDeliveryTimeDto.product} is currently inactive`);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updateDeliveryTimeDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updateDeliveryTimeDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${updateDeliveryTimeDto.refProduct} is currently inactive`);

    updatedDeliveryTime.supplier = supplier;
    updatedDeliveryTime.product = product;
    updatedDeliveryTime.refProduct = refProduct;

    Object.assign(deliveryTime, updatedDeliveryTime);

    await this.deliveryTimeRepository.save(deliveryTime);

    return {
      deliveryTime
    };
  }

  async remove(id: string) {
    const { deliveryTime } = await this.findOne(id);

    await this.deliveryTimeRepository.remove(deliveryTime);

    return {
      deliveryTime
    };
  }
}
