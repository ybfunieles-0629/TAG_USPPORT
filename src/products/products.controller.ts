import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/load')
  loadProducts(

  ) {
    return this.productsService.loadProducts();
  }

  @Post()
  create(
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(createProductDto);
  }

  @Post('create/multiple')
  createMultiple(
    @Body() createMultipleProducts: CreateProductDto[]
  ) {
    return this.productsService.createMultiple(createMultipleProducts);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Put('/update/multiple')
  updateMultiple(
    @Body() updateMultipleProducts: UpdateProductDto[]
  ) {
    return this.productsService.updateMultiple(updateMultipleProducts);
  }

  @Patch('/allow/:id')
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.productsService.remove(id);
  }
}
