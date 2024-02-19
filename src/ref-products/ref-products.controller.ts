import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RefProductsService } from './ref-products.service';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterRefProductsDto } from './dto/filter-ref-products.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('ref-products')
export class RefProductsController {
  constructor(private readonly refProductsService: RefProductsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createRefProductDto: CreateRefProductDto,
    @GetUser() user: User,
  ) {
    return this.refProductsService.create(createRefProductDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.refProductsService.findAll(paginationDto, user);
  }

  @Get('with/supplier/:id')
  filterProductsBySupplier(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.refProductsService.filterProductsBySupplier(id);
  }

  @Get('with/offers')
  filterProductsWithDiscount(
    @Query() paginationDto: PaginationDto
  ) {
    return this.refProductsService.filterProductsWithDiscount(paginationDto);
  }

  @Post('filter')
  filterRefProducts(
    @Query() paginationDto: PaginationDto,
    @Body() filterRefProductsDto: FilterRefProductsDto
  ) {
    return this.refProductsService.filterProducts(filterRefProductsDto, paginationDto);
  }

  @Get('is/allowed')
  @UseGuards(AuthGuard())
  filterReferencesByIsAllowed(
    @Query() paginationDto: PaginationDto
  ) {
    return this.refProductsService.filterReferencesByIsAllowed(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRefProductDto: UpdateRefProductDto,
    @GetUser() user: User,
  ) {
    return this.refProductsService.update(id, updateRefProductDto, user);
  }

  @Patch('/allow/:id')
  @UseGuards(AuthGuard())
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.refProductsService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.refProductsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.refProductsService.remove(id);
  }
}
