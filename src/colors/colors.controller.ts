import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColorDto: UpdateColorDto
  ) {
    return this.colorsService.update(id, updateColorDto);
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
