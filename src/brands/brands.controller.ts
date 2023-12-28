import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(AuthGuard())
  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @UseGuards(AuthGuard())
  @Post('/multiple')
  createMultipleBrands(@Body() createBrandsDto: CreateBrandDto[]) {
    return this.brandsService.createMultipleBrands(createBrandsDto);
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.brandsService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard())
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.brandsService.findOne(term);
  }

  @UseGuards(AuthGuard())
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateBrandDto: UpdateBrandDto
    ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @UseGuards(AuthGuard())
  @Put('/update/multiple')
  updateMultipleBrands(
    @Body() updateBrandsDto: UpdateBrandDto[]
    ) {
    return this.brandsService.updateMultipleBrands(updateBrandsDto);
  }

  @UseGuards(AuthGuard())
  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string, 
    ) {
    return this.brandsService.desactivate(id);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
