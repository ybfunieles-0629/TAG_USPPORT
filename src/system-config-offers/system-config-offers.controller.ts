import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { SystemConfigOffersService } from './system-config-offers.service';
import { CreateSystemConfigOfferDto } from './dto/create-system-config-offer.dto';
import { UpdateSystemConfigOfferDto } from './dto/update-system-config-offer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('system-config-offers')
export class SystemConfigOffersController {
  constructor(private readonly systemConfigOffersService: SystemConfigOffersService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createSystemConfigOfferDto: CreateSystemConfigOfferDto) {
    return this.systemConfigOffersService.create(createSystemConfigOfferDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.systemConfigOffersService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigOffersService.findOne(id);
  }

  @Get('products-with-offers')
  findProductsWithOffers(
    @Query() paginationDto: PaginationDto
  ) {
    return this.systemConfigOffersService.findProductsWithOffers(paginationDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemConfigOfferDto: UpdateSystemConfigOfferDto
  ) {
    return this.systemConfigOffersService.update(id, updateSystemConfigOfferDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.systemConfigOffersService.desactivate(id);
  }
  
  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigOffersService.remove(id);
  }
}
