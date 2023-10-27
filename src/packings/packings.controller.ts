import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { PackingsService } from './packings.service';
import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('packings')
export class PackingsController {
  constructor(private readonly packingsService: PackingsService) { }

  @Post()
  create(@Body() createPackingDto: CreatePackingDto) {
    return this.packingsService.create(createPackingDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.packingsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackingDto: UpdatePackingDto
  ) {
    return this.packingsService.update(id, updatePackingDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.packingsService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.remove(id);
  }
}
