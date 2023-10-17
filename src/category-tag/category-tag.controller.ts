import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';

import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category-tag')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

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
