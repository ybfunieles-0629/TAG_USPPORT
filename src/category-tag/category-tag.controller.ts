import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('category-tag')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

  @Post('request')
  @UseGuards(AuthGuard())
  requestCategory(
    @Body() createCategoryTagDto: CreateCategoryTagDto,
  ) {
    return this.categoryTagService.requestCategory(createCategoryTagDto);
  }

  @Post('send-message')
  @UseGuards(AuthGuard())
  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.categoryTagService.sendMessage(sendMessageDto);
  };

  @Post()
  @UseGuards(AuthGuard())
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
  @UseGuards(AuthGuard())
  filterSubCategoryByParent(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoryTagService.filterSubCategoryByParent(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryTagDto: UpdateCategoryTagDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryTagService.update(id, updateCategoryTagDto, file);
  }

  @Patch('/featured/:id')
  @UseGuards(AuthGuard())
  changeFeatured(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.changeFeatured(id);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoryTagService.remove(id);
  }
}
