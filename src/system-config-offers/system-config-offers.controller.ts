import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { SystemConfigOffersService } from './system-config-offers.service';
import { CreateSystemConfigOfferDto } from './dto/create-system-config-offer.dto';
import { UpdateSystemConfigOfferDto } from './dto/update-system-config-offer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('system-config-offers')
export class SystemConfigOffersController {
  constructor(private readonly systemConfigOffersService: SystemConfigOffersService) { }

  @UseGuards(AuthGuard())
  @Post()
  create(@Body() createSystemConfigOfferDto: CreateSystemConfigOfferDto) {
    return this.systemConfigOffersService.create(createSystemConfigOfferDto);
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.systemConfigOffersService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigOffersService.findOne(id);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemConfigOfferDto: UpdateSystemConfigOfferDto
  ) {
    return this.systemConfigOffersService.update(id, updateSystemConfigOfferDto);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.systemConfigOffersService.desactivate(id);
  }
  
  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigOffersService.remove(id);
  }
}
