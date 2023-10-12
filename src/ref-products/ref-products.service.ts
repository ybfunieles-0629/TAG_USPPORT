import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { RefProduct } from './entities/ref-product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarketDesignArea } from '../market-design-area/entities/market-design-area.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class RefProductsService {
  private readonly logger: Logger = new Logger('RefProductsService');

  constructor(
    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(MarketDesignArea)
    private readonly marketDesignAreaRepository: Repository<MarketDesignArea>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) { }

  async create(createRefProductDto: CreateRefProductDto) {
    try {
      const newRefProduct = plainToClass(RefProduct, createRefProductDto);

      const marketDesignArea: MarketDesignArea = await this.marketDesignAreaRepository.findOne({
        where: {
          id: createRefProductDto.marketDesignArea,
        },
      });

      if (!marketDesignArea)
        throw new NotFoundException(`Market design area with id ${createRefProductDto.marketDesignArea} not found`);

      if (!marketDesignArea.isActive)
        throw new BadRequestException(`Market design area with id ${createRefProductDto.marketDesignArea} is currently inactive`);

      const supplier: Supplier = await this.supplierRepository.findOne({
        where: {
          id: createRefProductDto.supplier,
        },
      });

      if (!supplier)
        throw new NotFoundException(`Suppplier with id ${createRefProductDto.supplier} not found`);

      if (!supplier.isActive)
        throw new BadRequestException(`Supplier with id ${createRefProductDto.supplier} is currently inactive`);

      newRefProduct.marketDesignArea = marketDesignArea;
      newRefProduct.supplier = supplier;

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
        'marketDesignArea',
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
        'marketDesignArea',
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
    return `This action updates a #${id} refProduct`;
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
