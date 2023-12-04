import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { CartQuotesService } from './cart-quotes.service';
import { CreateCartQuoteDto } from './dto/create-cart-quote.dto';
import { UpdateCartQuoteDto } from './dto/update-cart-quote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('cart-quotes')
export class CartQuotesController {
  constructor(private readonly cartQuotesService: CartQuotesService) { }

  @Post()
  create(@Body() createCartQuoteDto: CreateCartQuoteDto) {
    return this.cartQuotesService.create(createCartQuoteDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.cartQuotesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.cartQuotesService.findOne(id);
  }

  @Get('/filter-by-client/:clientId')
  filterByClient(
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.cartQuotesService.filterByClient(clientId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuoteDto: UpdateCartQuoteDto
  ) {
    return this.cartQuotesService.update(id, updateCartQuoteDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartQuotesService.desactivate(id);
  }

  @Patch('change-status/:id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuoteDto: UpdateCartQuoteDto,
  ) {
    return this.cartQuotesService.changeStatus(id, updateCartQuoteDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.cartQuotesService.remove(id);
  }
}
