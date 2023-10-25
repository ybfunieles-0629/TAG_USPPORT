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

    const state = await this.stateRepository.findOne({
      where: {
        id: createCartQuoteDto.state,
      },
    });

    if (!state)
      throw new NotFoundException(`State with id ${createCartQuoteDto.state} not found`);

    newCartQuote.client = client;
    newCartQuote.user = user;
    newCartQuote.state = state;

    await this.cartQuoteRepository.save(newCartQuote);

    return {
      newCartQuote
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.cartQuoteRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'client',
        'user',
        'state',
      ],
    });
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

    const state = await this.stateRepository.findOne({
      where: {
        id: updateCartQuoteDto.state,
      },
    });

    if (!state)
      throw new NotFoundException(`State with id ${updateCartQuoteDto.state} not found`);


    updatedCartQuote.client = client;
    updatedCartQuote.user = user;
    updatedCartQuote.state = state;

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
