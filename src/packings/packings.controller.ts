import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PackingsService } from './packings.service';
import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('packings')
export class PackingsController {
  constructor(private readonly packingsService: PackingsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createPackingDto: CreatePackingDto) {
    return this.packingsService.create(createPackingDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.packingsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackingDto: UpdatePackingDto
  ) {
    return this.packingsService.update(id, updatePackingDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.packingsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.remove(id);
  }
}
