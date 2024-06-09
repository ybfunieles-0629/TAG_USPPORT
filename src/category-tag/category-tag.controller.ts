import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('category-tag')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

  @Post('request')
  @UseGuards(AuthGuard())
  requestCategory(
    @GetUser() user: User,
    @Body() createCategoryTagDto: CreateCategoryTagDto,
  ) {
    return this.categoryTagService.requestCategory(createCategoryTagDto, user);
  }

  @Post('send-message')
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
    @GetUser() user: User,
  ) {
    return this.categoryTagService.create(createCategoryTagDto, file, user);
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
    @GetUser() user: User,
  ) {
    return this.categoryTagService.update(id, updateCategoryTagDto, file, user);
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
