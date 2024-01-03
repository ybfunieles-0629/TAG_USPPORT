import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Post('/multiple')
  @UseGuards(AuthGuard())
  createMultipleBrands(@Body() createBrandsDto: CreateBrandDto[]) {
    return this.brandsService.createMultipleBrands(createBrandsDto);
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
    @Body() updateBrandDto: UpdateBrandDto
    ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultipleBrands(
    @Body() updateBrandsDto: UpdateBrandDto[]
    ) {
    return this.brandsService.updateMultipleBrands(updateBrandsDto);
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
