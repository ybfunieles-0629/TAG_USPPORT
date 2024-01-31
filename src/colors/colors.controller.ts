import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

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
  ) {
    return this.colorsService.create(createColorDto, file);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleColors: CreateColorDto[]
  ) {
    return this.colorsService.createMultiple(createMultipleColors);
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

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColorDto: UpdateColorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.colorsService.update(id, updateColorDto, file);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleColors: UpdateColorDto[]
  ) {
    return this.colorsService.updateMultiple(updateMultipleColors);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.colorsService.remove(id);
  }
}
