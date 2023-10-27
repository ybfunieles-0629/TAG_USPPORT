import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { DisccountService } from './disccount.service';
import { CreateDisccountDto } from './dto/create-disccount.dto';
import { UpdateDisccountDto } from './dto/update-disccount.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('disccount')
export class DisccountController {
  constructor(private readonly disccountService: DisccountService) { }

  @Post()
  create(@Body() createDisccountDto: CreateDisccountDto) {
    return this.disccountService.create(createDisccountDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.disccountService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisccountDto: UpdateDisccountDto
  ) {
    return this.disccountService.update(id, updateDisccountDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disccountService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountService.remove(id);
  }
}
