import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateCartQuoteDto } from './dto/create-cart-quote.dto';
import { UpdateCartQuoteDto } from './dto/update-cart-quote.dto';
import { CartQuote } from './entities/cart-quote.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { State } from '../states/entities/state.entity';
import { QuoteDetail } from '../quote-details/entities/quote-detail.entity';
import { VariantReference } from '../variant-reference/entities/variant-reference.entity';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { MarkedServicePrice } from 'src/marked-service-prices/entities/marked-service-price.entity';
import { MarkingService } from 'src/marking-services/entities/marking-service.entity';
import { ExternalSubTechnique } from 'src/external-sub-techniques/entities/external-sub-technique.entity';
import { Logo } from 'src/logos/entities/logo.entity';

@Injectable()
export class CartQuotesService {
  constructor(
    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createCartQuoteDto: CreateCartQuoteDto) {
    const newCartQuote = plainToClass(CartQuote, createCartQuoteDto);

    const client = await this.clientRepository.findOne({
      where: {
        id: createCartQuoteDto.client,
      },
    });

    if (!client)
      throw new NotFoundException(`Client with id ${createCartQuoteDto.client} not found`);

    const user = await this.userRepository.findOne({
      where: {
        id: createCartQuoteDto.user,
      },
    });

    if (!user)
      throw new NotFoundException(`User with id ${createCartQuoteDto.user} not found`);

    if (createCartQuoteDto.state) {
      const state = await this.stateRepository.findOne({
        where: {
          id: createCartQuoteDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createCartQuoteDto.state} not found`);

      newCartQuote.state = state;
    }

    newCartQuote.client = client;
    newCartQuote.user = user;

    await this.cartQuoteRepository.save(newCartQuote);

    return {
      newCartQuote
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.cartQuoteRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const cartQuotes: CartQuote[] = await this.cartQuoteRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'quoteDetails',
        'quoteDetails.transportServices',
        'quoteDetails.product',
        'quoteDetails.product.colors',
        'quoteDetails.product.variantReferences',
        'quoteDetails.product.images',
        'quoteDetails.markingServices',
        'quoteDetails.markingServices.marking',
        'quoteDetails.markingServices.externalSubTechnique',
        'quoteDetails.markingServices.markingServiceProperty',
        'quoteDetails.product.refProduct',
      ],
    });

    const finalCartQuotes = cartQuotes.map((cartQuote: CartQuote) => {

      return {
        id: cartQuote.id,
        quoteName: cartQuote.quoteName,
        description: cartQuote.description,
        deliveryAddress: cartQuote.deliveryAddress,
        totalPrice: cartQuote.totalPrice,
        productsQuantity: cartQuote.productsQuantity,
        weightToOrder: cartQuote.weightToOrder,
        products: cartQuote.quoteDetails.map((quoteDetail: QuoteDetail) => {
          return {
            name: quoteDetail.product.refProduct.name,
            unitPrice: quoteDetail.unitPrice,
            quantity: quoteDetail.quantities,
            image: quoteDetail.product?.images[0]?.url || 'default.png',
            color: quoteDetail.product.colors[0].name,
            samplePrice: quoteDetail.product.samplePrice,
            refundSampleTime: quoteDetail.product.refundSampleTime,
            loanSample: quoteDetail.product.loanSample,
            variantReferences: quoteDetail.product.variantReferences.map((variantReference: VariantReference) => {
              return {
                name: variantReference.name,
              };
            }),
            markingServices: quoteDetail.markingServices.map((markingService: MarkingService) => {
              return {
                logo: markingService.logos.map((logo: Logo) => {
                  return {
                    logo: logo.logo,
                    mounting: logo.mounting
                  };
                }),
                calculatedMarkingPrice: markingService.calculatedMarkingPrice,
                markingTransportPrice: markingService.markingTransportPrice,
                marking: markingService.marking.name,
                externalSubTechnique: markingService.externalSubTechnique.name,
                markingServiceProperty: markingService.markingServiceProperty.name,
              };
            }),
          };
        }),
      };
    });

    return {
      count,
      finalCartQuotes
    };
  }

  async findOne(id: string) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'client',
        'user',
        'state',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    return {
      cartQuote
    };
  }

  async filterByClient(clientId: string) {
    const cartQuotes: CartQuote[] = await this.cartQuoteRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.client', 'client')
      .where('client.id =:clientId', { clientId: clientId })
      .getMany();

    if (!cartQuotes)
      throw new NotFoundException(`Cart quotes for client ${clientId} not found`);

    return {
      cartQuotes
    };
  };

  async update(id: string, updateCartQuoteDto: UpdateCartQuoteDto) {
    const cartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id,
      },
      relations: [
        'client',
        'user',
        'state',
      ],
    });

    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${id} not found`);

    const updatedCartQuote = plainToClass(CartQuote, updateCartQuoteDto);

    const client = await this.clientRepository.findOne({
      where: {
        id: updateCartQuoteDto.client,
      },
    });

    if (!client)
      throw new NotFoundException(`Client with id ${updateCartQuoteDto.client} not found`);

    const user = await this.userRepository.findOne({
      where: {
        id: updateCartQuoteDto.user,
      },
    });

    if (!user)
      throw new NotFoundException(`User with id ${updateCartQuoteDto.user} not found`);

    if (updateCartQuoteDto.state) {
      const state = await this.stateRepository.findOne({
        where: {
          id: updateCartQuoteDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updateCartQuoteDto.state} not found`);

      updatedCartQuote.state = state;
    }

    updatedCartQuote.client = client;
    updatedCartQuote.user = user;

    Object.assign(cartQuote, updatedCartQuote);

    await this.cartQuoteRepository.save(cartQuote);

    return {
      cartQuote
    };
  }

  async desactivate(id: string) {
    const { cartQuote } = await this.findOne(id);

    cartQuote.isActive = !cartQuote.isActive;

    await this.cartQuoteRepository.save(cartQuote);

    return {
      cartQuote
    };
  }

  async remove(id: string) {
    const { cartQuote } = await this.findOne(id);

    await this.cartQuoteRepository.remove(cartQuote);

    return {
      cartQuote
    };
  }
}
