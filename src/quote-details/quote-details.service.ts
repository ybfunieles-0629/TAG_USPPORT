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
import { MarkedServicePrice } from 'src/marked-service-prices/entities/marked-service-price.entity';

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
      relations: [
        'refProduct',
        'refProduct.supplier',
        'refProduct.supplier.disccounts',
        'refProduct.supplier.disccounts.disccounts',
      ],
    });

    if (!product)
      throw new NotFoundException(`Product with id ${createQuoteDetailDto.product} not found`);

    newQuoteDetail.cartQuote = cartQuote;
    newQuoteDetail.product = product;

    let markingTotalPrice: number = 0;

    if (createQuoteDetailDto.markingServices) {
      const markingServices: MarkingService[] = [];

      for (const markingServiceId of createQuoteDetailDto.markingServices) {
        const markingService: MarkingService = await this.markingServiceRepository.findOne({
          where: {
            id: markingServiceId,
          },
          relations: [
            'markingServiceProperty',
            'markingServiceProperty.markedServicePrices',
          ],
        });

        if (!markingService)
          throw new NotFoundException(`Marking service with id ${markingServiceId} not found`);

        if (!markingService.isActive)
          throw new BadRequestException(`Marking service with id ${markingServiceId} is currently inactive`);

        markingServices.push(markingService);
      }

      markingServices.forEach((markingService: MarkingService) => {
        (markingService?.markingServiceProperty?.markedServicePrices || [])
          .slice()
          .sort((a: MarkedServicePrice, b: MarkedServicePrice) => (a?.unitPrice || 0) - (b?.unitPrice || 0))
          .map((markedServicePrice: MarkedServicePrice) => {
            markingTotalPrice += markedServicePrice.unitPrice;

            return {
              markedServicePrice: markedServicePrice?.unitPrice || 0
            };
          });
      });

      newQuoteDetail.markingServices = markingServices;
      newQuoteDetail.markingTotalPrice = markingTotalPrice;
    };

    const discountProduct: number = newQuoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
      if (disccount.maxQuantity !== 0) {
        if (newQuoteDetail.quantities >= disccount.minQuantity && newQuoteDetail.quantities <= disccount.maxQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      } else {
        if (newQuoteDetail.quantities >= disccount.minQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      }
      return maxDiscount;
    }, 0);

    newQuoteDetail.sampleValue = product.samplePrice;
    newQuoteDetail.totalValue = newQuoteDetail.unitPrice * newQuoteDetail.quantities;
    newQuoteDetail.unitDiscount = newQuoteDetail.unitPrice * (discountProduct);
    newQuoteDetail.subTotal = (newQuoteDetail.unitPrice * newQuoteDetail.quantities) + markingTotalPrice;
    newQuoteDetail.discount = newQuoteDetail.unitPrice * (discountProduct / 100) * newQuoteDetail.quantities | 0;

    newQuoteDetail.subTotalWithDiscount = newQuoteDetail.subTotal - newQuoteDetail.discount | 0;
    newQuoteDetail.iva = (newQuoteDetail.subTotalWithDiscount * (newQuoteDetail.iva / 100)) | 0;
    newQuoteDetail.total = newQuoteDetail.subTotalWithDiscount + newQuoteDetail.iva | 0;

    console.log(newQuoteDetail);

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: newQuoteDetail.cartQuote.id,
      }
    });

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${newQuoteDetail.cartQuote.id} not found`);

    cartQuoteDb.totalPrice += newQuoteDetail.total;
    cartQuoteDb.productsQuantity += newQuoteDetail.quantities; 

    await this.cartQuoteRepository.save(cartQuoteDb);
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

    const discountProduct: number = updatedQuoteDetail.product.refProduct.supplier.disccounts[0].disccounts.reduce((maxDiscount, disccount) => {
      if (disccount.maxQuantity !== 0) {
        if (updatedQuoteDetail.quantities >= disccount.minQuantity && updatedQuoteDetail.quantities <= disccount.maxQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      } else {
        if (updatedQuoteDetail.quantities >= disccount.minQuantity) {
          return Math.max(maxDiscount, disccount.disccountValue);
        }
      }
      return maxDiscount;
    }, 0);

    updatedQuoteDetail.sampleValue = product.samplePrice;
    updatedQuoteDetail.totalValue = updatedQuoteDetail.unitPrice * updatedQuoteDetail.quantities;
    updatedQuoteDetail.unitDiscount = updatedQuoteDetail.unitPrice * (discountProduct);
    updatedQuoteDetail.subTotal = updatedQuoteDetail.unitPrice * updatedQuoteDetail.quantities + updatedQuoteDetail.markingTotalPrice;
    updatedQuoteDetail.discount = updatedQuoteDetail.unitPrice * (discountProduct / 100) * updatedQuoteDetail.quantities | 0;
    
    updatedQuoteDetail.subTotalWithDiscount = updatedQuoteDetail.subTotal - updatedQuoteDetail.discount;
    updatedQuoteDetail.iva = (updatedQuoteDetail.subTotalWithDiscount * (updatedQuoteDetail.iva / 100));
    updatedQuoteDetail.total = updatedQuoteDetail.subTotalWithDiscount + updatedQuoteDetail.iva;

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
