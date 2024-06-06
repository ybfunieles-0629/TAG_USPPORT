import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { QuoteDetailsService } from './quote-details.service';
import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { DiscountQuoteDetailDto } from './dto/discount-price.dto';
import { CalculateSummaryDto } from './dto/calculate-price-summary.tdo';

@Controller('quote-details')
export class QuoteDetailsController {
  constructor(private readonly quoteDetailsService: QuoteDetailsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createQuoteDetailDto: CreateQuoteDetailDto,
    @GetUser() user: User,
    ) {
    return this.quoteDetailsService.create(createQuoteDetailDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.quoteDetailsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.quoteDetailsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuoteDetailDto: UpdateQuoteDetailDto,
    @Query('save') save: number,

  ) {
    return this.quoteDetailsService.update(id, updateQuoteDetailDto, save);
  }



  @Patch('/up/:id')
  @UseGuards(AuthGuard())
  updateUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuoteDetailDto: CreateQuoteDetailDto,
    @Query('save') save: number,
    @GetUser() user: User,
  ) {
    return this.quoteDetailsService.updateUp(id, updateQuoteDetailDto, save, user);
  }



  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.quoteDetailsService.desactivate(id);
  }



  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.quoteDetailsService.remove(id);
  }




  @Patch('/discount/:id')
  @UseGuards(AuthGuard())
  updateUpDiscountAditional(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuoteDetailDto: DiscountQuoteDetailDto,
    @Query('save') save: number,
    @GetUser() user: User,
  ) {
    return this.quoteDetailsService.updateUpDiscountAditional(id, updateQuoteDetailDto, save, user);
  }





  @Post('/summary')
  @UseGuards(AuthGuard())
  productSummary(
    @Body() calculateSummaryDto: CalculateSummaryDto,
    @GetUser() user: User,
  ) {
    return this.quoteDetailsService.productSummary(calculateSummaryDto, user);
  } 



}
