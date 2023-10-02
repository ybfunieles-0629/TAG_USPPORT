import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Post('/multiple')
  createMultipleBrands(@Body() createBrandsDto: CreateBrandDto[]) {
    return this.brandsService.createMultipleBrands(createBrandsDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.brandsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.brandsService.findOne(term);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateBrandDto: UpdateBrandDto
    ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Put('/update/multiple')
  updateMultipleBrands(
    @Body() updateBrandsDto: UpdateBrandDto[]
    ) {
    return this.brandsService.updateMultipleBrands(updateBrandsDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string, 
    ) {
    return this.brandsService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
