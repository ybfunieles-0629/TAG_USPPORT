import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { QuoteDetailsService } from './quote-details.service';
import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('quote-details')
export class QuoteDetailsController {
  constructor(private readonly quoteDetailsService: QuoteDetailsService) { }

  @Post()
  create(@Body() createQuoteDetailDto: CreateQuoteDetailDto) {
    return this.quoteDetailsService.create(createQuoteDetailDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.quoteDetailsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.quoteDetailsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuoteDetailDto: UpdateQuoteDetailDto
  ) {
    return this.quoteDetailsService.update(id, updateQuoteDetailDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.quoteDetailsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.quoteDetailsService.remove(id);
  }
}
