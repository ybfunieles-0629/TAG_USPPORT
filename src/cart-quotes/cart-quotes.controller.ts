import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CartQuotesService } from './cart-quotes.service';
import { CreateCartQuoteDto } from './dto/create-cart-quote.dto';
import { UpdateCartQuoteDto } from './dto/update-cart-quote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { RemoveQuoteDetailDto } from './dto/remove-quote-detail.dto';

@Controller('cart-quotes')
export class CartQuotesController {
  constructor(private readonly cartQuotesService: CartQuotesService) { }

  @Post()
  create(
    // @GetUser() user: User,
    @Body() createCartQuoteDto: CreateCartQuoteDto,
  ) {
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
    @Query() paginationDto: PaginationDto,
  ) {
    return this.cartQuotesService.filterByClient(id, paginationDto);
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
    @Body() updateCartQuoteDto: UpdateCartQuoteDto,
    @GetUser() user: User,
  ) {
    return this.cartQuotesService.update(id, updateCartQuoteDto, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartQuotesService.desactivate(id);
  }

  @Patch('remove/quote-details/:id')
  @UseGuards(AuthGuard())
  removeQuoteDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removeQuoteDetailDto: RemoveQuoteDetailDto
  ) {
    return this.cartQuotesService.removeQuoteDetail(id, removeQuoteDetailDto);
  }

  @Patch('change-status/:id')
  @UseGuards(AuthGuard())
  changeStatus(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartQuoteDto: UpdateCartQuoteDto,
  ) {
    return this.cartQuotesService.changeStatus(user, id, updateCartQuoteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.cartQuotesService.remove(id);
  }
}
