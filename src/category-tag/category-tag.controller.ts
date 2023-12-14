import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFile, Query } from '@nestjs/common';

import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category-tag')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

  @Post('request')
  requestCategory(
    @Body() createCategoryTagDto: CreateCategoryTagDto,
  ) {
    return this.categoryTagService.requestCategory(createCategoryTagDto);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryTagDto: CreateCategoryTagDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryTagService.create(createCategoryTagDto, file);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.categoryTagService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.findOne(id);
  }

  @Get('filter-by-parent/:id')
  filterSubCategoryByParent(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryTagService.filterSubCategoryByParent(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryTagDto: UpdateCategoryTagDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryTagService.update(id, updateCategoryTagDto, file);
  }

  @Patch('/featured/:id')
  changeFeatured(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.changeFeatured(id);
  }

  @Patch('/desactivate/:id')
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
