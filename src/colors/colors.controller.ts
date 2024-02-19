import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) { }

  @Post('load')
  @UseGuards(AuthGuard())
  loadColors(

  ) {
    return this.colorsService.loadColors();
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createColorDto: CreateColorDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.colorsService.create(createColorDto, file, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleColors: CreateColorDto[],
    @GetUser() user: User,
  ) {
    return this.colorsService.createMultiple(createMultipleColors, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.colorsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.colorsService.findOne(id);
  }

  @Get('filter/by/reference/:id')
  findOneByRefProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.colorsService.findOneByRefProduct(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColorDto: UpdateColorDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.colorsService.update(id, updateColorDto, file, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleColors: UpdateColorDto[],
    @GetUser() user: User,
  ) {
    return this.colorsService.updateMultiple(updateMultipleColors, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.colorsService.remove(id);
  }
}
