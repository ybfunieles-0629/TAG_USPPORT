import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('category-tag')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

  @Post()
  create(@Body() createCategoryTagDto: CreateCategoryTagDto) {
    return this.categoryTagService.create(createCategoryTagDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.categoryTagService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryTagDto: UpdateCategoryTagDto
  ) {
    return this.categoryTagService.update(id, updateCategoryTagDto);
  }

  @Patch(':id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.remove(id);
  }
}
