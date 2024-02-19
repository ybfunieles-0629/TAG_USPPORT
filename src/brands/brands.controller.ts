import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createBrandDto: CreateBrandDto,
    @GetUser() user: User,
  ) {
    return this.brandsService.create(createBrandDto, user);
  }

  @Post('/multiple')
  @UseGuards(AuthGuard())
  createMultipleBrands(
    @Body() createBrandsDto: CreateBrandDto[],
    @GetUser() user: User,
  ) {
    return this.brandsService.createMultipleBrands(createBrandsDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.brandsService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(@Param('term') term: string) {
    return this.brandsService.findOne(term);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @GetUser() user: User,
  ) {
    return this.brandsService.update(id, updateBrandDto, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultipleBrands(
    @Body() updateBrandsDto: UpdateBrandDto[],
    @GetUser() user: User,
  ) {
    return this.brandsService.updateMultipleBrands(updateBrandsDto, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.brandsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
