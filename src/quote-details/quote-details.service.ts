import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuote } from '../cart-quotes/entities/cart-quote.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class QuoteDetailsService {
  constructor(
    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createQuoteDetailDto: CreateQuoteDetailDto) {
    const newQuoteDetail = plainToClass(QuoteDetail, createQuoteDetailDto);

    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: createQuoteDetailDto.cartQuote,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${createQuoteDetailDto} not found`);

    const product = await this.productRepository.findOne({
      where: {
        id: createQuoteDetailDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createQuoteDetailDto.product} not found`);

    newQuoteDetail.cartQuote = cartQuote;
    newQuoteDetail.product = product;

    await this.quoteDetailRepository.save(newQuoteDetail);

    return {
      newQuoteDetail
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.quoteDetailRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    return {
      quoteDetail
    };
  }

  async update(id: string, updateQuoteDetailDto: UpdateQuoteDetailDto) {
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, updateQuoteDetailDto);

    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: updateQuoteDetailDto.cartQuote,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${updateQuoteDetailDto} not found`);

    const product = await this.productRepository.findOne({
      where: {
        id: updateQuoteDetailDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${updateQuoteDetailDto.product} not found`);

    updatedQuoteDetail.cartQuote = cartQuote;
    updatedQuoteDetail.product = product;

    Object.assign(quoteDetail, updatedQuoteDetail);

    await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail
    };
  }

  async desactivate(id: string) {
    const { quoteDetail } = await this.findOne(id);

    quoteDetail.isActive = !quoteDetail.isActive;

    await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail
    };
  }

  async remove(id: string) {
    const { quoteDetail } = await this.findOne(id);

    await this.quoteDetailRepository.remove(quoteDetail);

    return {
      quoteDetail
    };
  }
}
