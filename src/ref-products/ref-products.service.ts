import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { RefProduct } from './entities/ref-product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Marking } from '../markings/entities/marking.entity';

@Injectable()
export class RefProductsService {
  private readonly logger: Logger = new Logger('RefProductsService');

  constructor(
    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Marking)
    private readonly markingRepository: Repository<Marking>,
  ) { }

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

      const markings: Marking[] = [];

      if (createRefProductDto.markings) {
        for (const markingId of createRefProductDto.markings) {
          const marking: Marking = await this.markingRepository.findOne({
            where: {
              id: markingId,
            },
          });

          if (!marking)
            throw new NotFoundException(`Marking with id ${markingId} not found`);

          if (!marking.isActive)
            throw new BadRequestException(`Marking with id ${markingId} is currently inactive`);

          markings.push(marking);
        }
      }

      newRefProduct.markings = markings;

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
        'supplier',
        'markings'
      ],
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${id} not found`);

    const updatedRefProduct = plainToClass(RefProduct, updateRefProductDto);

    const markings: Marking[] = [];

    const supplier: Supplier = await this.supplierRepository.findOne({
      where: {
        id: updateRefProductDto.supplier,
      },
    });

    if (!supplier)
      throw new NotFoundException(`Suppplier with id ${updateRefProductDto.supplier} not found`);

    if (!supplier.isActive)
      throw new BadRequestException(`Supplier with id ${updateRefProductDto.supplier} is currently inactive`);

    if (updateRefProductDto.markings) {
      for (const markingId of updateRefProductDto.markings) {
        const marking: Marking = await this.markingRepository.findOne({
          where: {
            id: markingId,
          },
        });

        if (!marking)
          throw new NotFoundException(`Marking with id ${markingId} not found`);

        if (!marking.isActive)
          throw new BadRequestException(`Marking with id ${markingId} is currently inactive`);

        markings.push(marking);
      };
    };

    updatedRefProduct.markings = markings;
    updatedRefProduct.supplier = supplier;

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
