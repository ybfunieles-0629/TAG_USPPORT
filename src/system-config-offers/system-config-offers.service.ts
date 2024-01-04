import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateSystemConfigOfferDto } from './dto/create-system-config-offer.dto';
import { UpdateSystemConfigOfferDto } from './dto/update-system-config-offer.dto';
import { SystemConfigOffer } from './entities/system-config-offer.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SystemConfigOffersService {
  constructor(
    @InjectRepository(SystemConfigOffer)
    private readonly systemConfigOfferRepository: Repository<SystemConfigOffer>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createSystemConfigOfferDto: CreateSystemConfigOfferDto) {
    const newSystemConfigOffer: SystemConfigOffer = plainToClass(SystemConfigOffer, createSystemConfigOfferDto);
    
    if (createSystemConfigOfferDto.product) {
      const productId: string = createSystemConfigOfferDto.product;
      
      const product: Product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${productId} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${productId} is currently inactive`);

      newSystemConfigOffer.product = product;
    };

    await this.systemConfigOfferRepository.save(newSystemConfigOffer);

    return {
      newSystemConfigOffer
    };
  };

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.systemConfigOfferRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SystemConfigOffer[] = await this.systemConfigOfferRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'product',
      ],
    });

    return {
      count,
      results
    };
  };

  async findOne(id: string) {
    const systemConfigOffer: SystemConfigOffer = await this.systemConfigOfferRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
      ],
    });

    if (!systemConfigOffer)
      throw new NotFoundException(`System config offer with id ${id} not found`);

    return {
      systemConfigOffer
    };
  };

  async update(id: string, updateSystemConfigOfferDto: UpdateSystemConfigOfferDto) {
    const systemConfigOffer: SystemConfigOffer = await this.systemConfigOfferRepository.findOne({
      where: {
        id,
      },
    });

    if (!systemConfigOffer)
      throw new NotFoundException(`System config offer with id ${id} not found`);

    const updatedSystemConfigOffer: SystemConfigOffer = plainToClass(SystemConfigOffer, updateSystemConfigOfferDto);

    if (updateSystemConfigOfferDto.product) {
      const productId: string = updateSystemConfigOfferDto.product;
      
      const product: Product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${productId} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${productId} is currently inactive`);

      updatedSystemConfigOffer.product = product;
    };

    Object.assign(systemConfigOffer, updatedSystemConfigOffer);

    await this.systemConfigOfferRepository.save(systemConfigOffer);

    return {
      systemConfigOffer
    };
  };

  async desactivate(id: string) {
    const { systemConfigOffer } = await this.findOne(id);

    systemConfigOffer.isActive = !systemConfigOffer.isActive;

    await this.systemConfigOfferRepository.save(systemConfigOffer);

    return {
      systemConfigOffer
    };
  };

  async remove(id: string) {
    const { systemConfigOffer } = await this.findOne(id);

    await this.systemConfigOfferRepository.remove(systemConfigOffer);

    return {
      systemConfigOffer
    };
  };
}