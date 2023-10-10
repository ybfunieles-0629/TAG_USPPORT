import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateVariantReferenceDto } from './dto/create-variant-reference.dto';
import { UpdateVariantReferenceDto } from './dto/update-variant-reference.dto';
import { VariantReference } from './entities/variant-reference.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class VariantReferenceService {
  private readonly logger: Logger = new Logger('VariantReferenceService');

  constructor(
    @InjectRepository(VariantReference)
    private readonly variantReferenceRepository: Repository<VariantReference>,
  ) { }

  async create(createVariantReferenceDto: CreateVariantReferenceDto) {
    try {
      const variantReference = this.variantReferenceRepository.create(createVariantReferenceDto);

      await this.variantReferenceRepository.save(variantReference);
      
      return {
        variantReference
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.variantReferenceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const variantReference = await this.variantReferenceRepository.findOne({
      where: {
        id
      },
    });

    if (!variantReference)
      throw new NotFoundException(`Variant reference with id ${id} not found`);
    
    return {
      variantReference
    };
  }

  async update(id: string, updateVariantReferenceDto: UpdateVariantReferenceDto) {
    return `This action updates a #${id} variantReference`;
  }

  async remove(id: string) {
    const { variantReference } = await this.findOne(id);

    await this.variantReferenceRepository.remove(variantReference);

    return {
      variantReference
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
