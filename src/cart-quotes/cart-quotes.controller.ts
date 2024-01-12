import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('dupply/:id')
  dupplyCartQuote(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartQuotesService.dupplyCartQuote(id);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.cartQuotesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.cartQuotesService.findOne(id);
  }

  @Get('/filter-by-client/:id')
  @UseGuards(AuthGuard())
  filterByClient(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() isCommercial: any
    ) {
    return this.cartQuotesService.filterByClient(id, isCommercial);
  }

  // @Get('commercial/:id')
  // getCartQuotesByCommercial(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Query() paginationDto: PaginationDto
  // ) {
  //   return this.cartQuotesService.getCartQuotesByCommercial(id, paginationDto);
  // }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuoteDto: UpdateCartQuoteDto
  ) {
    return this.cartQuotesService.update(id, updateCartQuoteDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartQuotesService.desactivate(id);
  }

  @Patch('change-status/:id')
  @UseGuards(AuthGuard())
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuoteDto: UpdateCartQuoteDto,
  ) {
    return this.cartQuotesService.changeStatus(id, updateCartQuoteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.cartQuotesService.remove(id);
  }
}
