import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuote } from '../cart-quotes/entities/cart-quote.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingService } from '../marking-services/entities/marking-service.entity';

@Injectable()
export class QuoteDetailsService {
  constructor(
    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createQuoteDetailDto: CreateQuoteDetailDto) {
    const newQuoteDetail: QuoteDetail = plainToClass(QuoteDetail, createQuoteDetailDto);

    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: createQuoteDetailDto.cartQuote,
      },
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${createQuoteDetailDto} not found`);

    const product: Product = await this.productRepository.findOne({
      where: {
        id: createQuoteDetailDto.product,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createQuoteDetailDto.product} not found`);

    newQuoteDetail.cartQuote = cartQuote;
    newQuoteDetail.product = product;

    if (createQuoteDetailDto.markingServices) {
      const markingServices: MarkingService[] = [];
      
      for (const markingServiceId of createQuoteDetailDto.markingServices) {
        const markingService: MarkingService = await this.markingServiceRepository.findOne({
          where: {
            id: markingServiceId,
          },
        });

        if (!markingService)
          throw new NotFoundException(`Marking service with id ${markingServiceId} not found`);

        if (!markingService.isActive)
          throw new BadRequestException(`Marking service with id ${markingServiceId} is currently inactive`);

        markingServices.push(markingService);
      }
      
      newQuoteDetail.markingServices = markingServices;
    };

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
      relations: [
        'markingServices',
      ],
    });
  }

  async findOne(id: string) {
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingServices',
      ],
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
