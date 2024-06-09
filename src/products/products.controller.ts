import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { ProductsService } from './products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { RequireProductDto } from './dto/require-product.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('/load')
  // @UseGuards(AuthGuard())
  loadProducts(
    @Query('supplier') supplier: string,
  ) {
    return this.productsService.loadProducts(supplier);
  }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
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
    @Body() createMultipleProducts: CreateProductDto[],
    @GetUser() user: User,
  ) {
    return this.productsService.createMultiple(createMultipleProducts, user);
  }

  @Post('require/product')
  // @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  requireProduct(
    @Body() requireProductDto: RequireProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Query('tipo') tipo: number,
  ) {
    return this.productsService.requireProduct(requireProductDto, file, tipo);
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

  @Get('with/calculations/:id')
  findOneWithCalculations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('quantity') quantity: number,
  ) {
    return this.productsService.findOneWithCalculations(id, quantity);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleProducts: UpdateProductDto[],
    @GetUser() user: User,
  ) {
    return this.productsService.updateMultiple(updateMultipleProducts, user);
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
