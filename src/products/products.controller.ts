import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { RequireProductDto } from './dto/require-product.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('/load')
  @UseGuards(AuthGuard())
  loadProducts(

  ) {
    return this.productsService.loadProducts();
  }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get('with/supplier/:id')
  filterProductsBySupplier(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.filterProductsBySupplier(id);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleProducts: CreateProductDto[]
  ) {
    return this.productsService.createMultiple(createMultipleProducts);
  }

  @Post('require/product')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  requireProduct(
    @Body() requireProductDto: RequireProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.requireProduct(requireProductDto, file);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleProducts: UpdateProductDto[]
  ) {
    return this.productsService.updateMultiple(updateMultipleProducts);
  }

  @Patch('/allow/:id')
  @UseGuards(AuthGuard())
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.changeIsAllowedStatus(id);
  }

  @Patch('/allow/multiple')
  @UseGuards(AuthGuard())
  changeMultipleIsAllowedStatus(
    @Body() ids: string[],
  ) {
    return this.productsService.changeMultipleIsAllowedStatus(ids);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.remove(id);
  }
}
