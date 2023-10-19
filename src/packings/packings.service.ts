import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { Packing } from './entities/packing.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { plainToClass } from 'class-transformer';
import { Product } from '../products/entities/product.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';

@Injectable()
export class PackingsService {
  private readonly logger: Logger = new Logger('PackingsService');

  constructor(
    @InjectRepository(Packing)
    private readonly packingRepository: Repository<Packing>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createPackingDto: CreatePackingDto) {
    const newPacking = plainToClass(Packing, createPackingDto);

    const product = await this.productRepository.findOne({
      where: {
        id: createPackingDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createPackingDto.product} not found`);

    if (!product.isActive)
      throw new BadRequestException(`Product with id ${createPackingDto.product} is currently inactive`);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: createPackingDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${createPackingDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${createPackingDto.refProduct} is currently inactive`);

    newPacking.product = product;
    newPacking.refProduct = refProduct;

    await this.packingRepository.save(newPacking);

    return {
      newPacking
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.packingRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'product',
        'refProduct',
      ],
    });
  }

  async findOne(id: string) {
    const packing = await this.packingRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProduct',
      ],
    });

    if (!packing)
      throw new NotFoundException(`Packing with id ${id} not found`);

    return {
      packing
    };
  }

  async update(id: string, updatePackingDto: UpdatePackingDto) {
    const packing = await this.packingRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProduct',
      ],
    });

    const updatedPacking = plainToClass(Packing, updatePackingDto);

    const product = await this.productRepository.findOne({
      where: {
        id: updatePackingDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${updatePackingDto.product} not found`);

    if (!product.isActive)
      throw new BadRequestException(`Product with id ${updatePackingDto.product} is currently inactive`);

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updatePackingDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updatePackingDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${updatePackingDto.refProduct} is currently inactive`);

    updatedPacking.product = product;
    updatedPacking.refProduct = refProduct;

    Object.assign(packing, updatedPacking);

    await this.packingRepository.save(packing);

    return {
      packing
    };
  }

  async desactivate(id: string) {
    const { packing } = await this.findOne(id);

    packing.isActive = !packing.isActive;

    await this.packingRepository.save(packing);

    return {
      packing
    };
  }

  async remove(id: string) {
    const { packing } = await this.findOne(id);

    await this.packingRepository.remove(packing);

    return {
      packing
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
