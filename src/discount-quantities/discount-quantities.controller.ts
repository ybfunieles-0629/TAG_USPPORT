import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DiscountQuantitiesService } from './discount-quantities.service';
import { CreateDiscountQuantityDto } from './dto/create-discount-quantity.dto';
import { UpdateDiscountQuantityDto } from './dto/update-discount-quantity.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('discount-quantities')
export class DiscountQuantitiesController {
  constructor(private readonly discountQuantitiesService: DiscountQuantitiesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createDiscountQuantityDto: CreateDiscountQuantityDto,
    @GetUser() user: User,
  ) {
    return this.discountQuantitiesService.create(createDiscountQuantityDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.discountQuantitiesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.discountQuantitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateDiscountQuantityDto: UpdateDiscountQuantityDto,
    @GetUser() user: User,
  ) {
    return this.discountQuantitiesService.update(id, updateDiscountQuantityDto, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.discountQuantitiesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.discountQuantitiesService.remove(id);
  }
}
